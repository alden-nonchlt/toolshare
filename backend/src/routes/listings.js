const express = require('express');
const db = require('../db');
const requireAuth = require('../middleware/auth');

const router = express.Router();

// GET all active listings (public), supports ?category= and ?search=
router.get('/', (req, res) => {
  const { category, search } = req.query;
  let query = 'SELECT * FROM listings WHERE status = ?';
  const params = ['active'];

  if (category) {
    query += ' AND category = ?';
    params.push(category);
  }
  if (search) {
    query += ' AND (title LIKE ? OR description LIKE ?)';
    params.push(`%${search}%`, `%${search}%`);
  }

  const listings = db.prepare(query).all(...params);
  res.json(listings);
});

// GET single listing (public)
router.get('/:id', (req, res) => {
  const listing = db.prepare('SELECT * FROM listings WHERE id = ?').get(req.params.id);
  if (!listing) return res.status(404).json({ error: 'Listing not found' });
  res.json(listing);
});

// POST create listing (protected)
router.post('/', requireAuth, (req, res) => {
  const { title, description, category, condition, photo_url } = req.body;
  if (!title) return res.status(400).json({ error: 'Title is required' });

  const result = db.prepare(
    `INSERT INTO listings (owner_id, title, description, category, condition, photo_url)
     VALUES (?, ?, ?, ?, ?, ?)`
  ).run(req.user.id, title, description || null, category || null, condition || null, photo_url || null);

  const listing = db.prepare('SELECT * FROM listings WHERE id = ?').get(result.lastInsertRowid);
  res.status(201).json(listing);
});

// PUT update listing (protected, owner only)
router.put('/:id', requireAuth, (req, res) => {
  const listing = db.prepare('SELECT * FROM listings WHERE id = ?').get(req.params.id);
  if (!listing) return res.status(404).json({ error: 'Listing not found' });
  if (listing.owner_id !== req.user.id) {
    return res.status(403).json({ error: 'You do not own this listing' });
  }

  const { title, description, category, condition, photo_url } = req.body;
  db.prepare(
    `UPDATE listings SET title = ?, description = ?, category = ?, condition = ?, photo_url = ? WHERE id = ?`
  ).run(
    title || listing.title,
    description ?? listing.description,
    category ?? listing.category,
    condition ?? listing.condition,
    photo_url ?? listing.photo_url,
    req.params.id
  );

  const updated = db.prepare('SELECT * FROM listings WHERE id = ?').get(req.params.id);
  res.json(updated);
});

// DELETE listing (protected, owner only)
router.delete('/:id', requireAuth, (req, res) => {
  const listing = db.prepare('SELECT * FROM listings WHERE id = ?').get(req.params.id);
  if (!listing) return res.status(404).json({ error: 'Listing not found' });
  if (listing.owner_id !== req.user.id) {
    return res.status(403).json({ error: 'You do not own this listing' });
  }

  db.prepare('DELETE FROM listings WHERE id = ?').run(req.params.id);
  res.json({ message: 'Listing deleted' });
});

module.exports = router;