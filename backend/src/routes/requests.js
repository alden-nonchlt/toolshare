const express = require('express');
const db = require('../db');
const requireAuth = require('../middleware/auth');

const router = express.Router();

// POST create a request (protected)
router.post('/', requireAuth, (req, res) => {
  const { listing_id } = req.body;
  if (!listing_id) return res.status(400).json({ error: 'listing_id is required' });

  const listing = db.prepare('SELECT * FROM listings WHERE id = ?').get(listing_id);
  if (!listing) return res.status(404).json({ error: 'Listing not found' });

  if (listing.owner_id === req.user.id) {
    return res.status(400).json({ error: 'You cannot request your own listing' });
  }
  if (!listing.is_available) {
    return res.status(400).json({ error: 'This listing is not available' });
  }

  const result = db.prepare(
    'INSERT INTO requests (listing_id, requester_id, status) VALUES (?, ?, ?)'
  ).run(listing_id, req.user.id, 'pending');

  const request = db.prepare('SELECT * FROM requests WHERE id = ?').get(result.lastInsertRowid);
  res.status(201).json(request);
});

// GET requests I made
router.get('/mine', requireAuth, (req, res) => {
  const requests = db.prepare(
    `SELECT r.*, l.title, l.photo_url FROM requests r
     JOIN listings l ON r.listing_id = l.id
     WHERE r.requester_id = ?`
  ).all(req.user.id);
  res.json(requests);
});

// GET requests on my listings
router.get('/incoming', requireAuth, (req, res) => {
  const requests = db.prepare(
    `SELECT r.*, l.title, l.photo_url FROM requests r
     JOIN listings l ON r.listing_id = l.id
     WHERE l.owner_id = ?`
  ).all(req.user.id);
  res.json(requests);
});

// Helper: load request + check the current user owns the related listing
function getOwnedRequest(req, res) {
  const request = db.prepare('SELECT * FROM requests WHERE id = ?').get(req.params.id);
  if (!request) {
    res.status(404).json({ error: 'Request not found' });
    return null;
  }
  const listing = db.prepare('SELECT * FROM listings WHERE id = ?').get(request.listing_id);
  if (listing.owner_id !== req.user.id) {
    res.status(403).json({ error: 'You do not own this listing' });
    return null;
  }
  return { request, listing };
}

// PUT approve
router.put('/:id/approve', requireAuth, (req, res) => {
  const data = getOwnedRequest(req, res);
  if (!data) return;
  if (data.request.status !== 'pending') {
    return res.status(400).json({ error: 'Only pending requests can be approved' });
  }

  db.prepare("UPDATE requests SET status = 'approved', updated_at = CURRENT_TIMESTAMP WHERE id = ?").run(req.params.id);
  db.prepare('UPDATE listings SET is_available = 0 WHERE id = ?').run(data.listing.id);

  res.json({ message: 'Request approved' });
});

// PUT reject
router.put('/:id/reject', requireAuth, (req, res) => {
  const data = getOwnedRequest(req, res);
  if (!data) return;
  if (data.request.status !== 'pending') {
    return res.status(400).json({ error: 'Only pending requests can be rejected' });
  }

  db.prepare("UPDATE requests SET status = 'rejected', updated_at = CURRENT_TIMESTAMP WHERE id = ?").run(req.params.id);

  res.json({ message: 'Request rejected' });
});

// PUT return
router.put('/:id/return', requireAuth, (req, res) => {
  const data = getOwnedRequest(req, res);
  if (!data) return;
  if (data.request.status !== 'approved') {
    return res.status(400).json({ error: 'Only approved requests can be marked as returned' });
  }

  db.prepare("UPDATE requests SET status = 'returned', updated_at = CURRENT_TIMESTAMP WHERE id = ?").run(req.params.id);
  db.prepare('UPDATE listings SET is_available = 1 WHERE id = ?').run(data.listing.id);

  res.json({ message: 'Request marked as returned' });
});

module.exports = router;