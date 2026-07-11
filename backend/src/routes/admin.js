const express = require('express');
const db = require('../db');
const requireAuth = require('../middleware/auth');
const requireAdmin = require('../middleware/admin');

const router = express.Router();
router.use(requireAuth, requireAdmin);

router.get('/listings', (req, res) => {
  const listings = db.prepare(`
    SELECT l.*, u.name AS owner_name, u.email AS owner_email
    FROM listings l JOIN users u ON l.owner_id = u.id
    ORDER BY l.created_at DESC
  `).all();
  res.json(listings);
});

router.get('/users', (req, res) => {
  const users = db.prepare(`
    SELECT id, name, email, role, is_active, created_at
    FROM users ORDER BY created_at DESC
  `).all();
  res.json(users);
});

router.put('/listings/:id/flag', (req, res) => {
  const listing = db.prepare('SELECT id FROM listings WHERE id = ?').get(req.params.id);
  if (!listing) return res.status(404).json({ error: 'Listing not found' });

  db.prepare("UPDATE listings SET status = 'flagged' WHERE id = ?").run(req.params.id);
  res.json({ message: 'Listing flagged' });
});

router.put('/users/:id/deactivate', (req, res) => {
  if (Number(req.params.id) === req.user.id) {
    return res.status(400).json({ error: 'You cannot deactivate your own account' });
  }
  const user = db.prepare('SELECT id FROM users WHERE id = ?').get(req.params.id);
  if (!user) return res.status(404).json({ error: 'User not found' });

  db.prepare('UPDATE users SET is_active = 0 WHERE id = ?').run(req.params.id);
  res.json({ message: 'User deactivated' });
});

module.exports = router;
