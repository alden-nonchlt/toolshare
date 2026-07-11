require('dotenv').config();
const express = require('express');
const cors = require('cors');
const db = require('./src/db');
const authRoutes = require('./src/routes/auth');
const listingRoutes = require('./src/routes/listings');

const app = express();
app.use(cors());
app.use(express.json());

app.use('/api/auth', authRoutes);
app.use('/api/listings', listingRoutes);

app.get('/api/health', (req, res) => {
  const userCount = db.prepare('SELECT COUNT(*) as count FROM users').get();
  res.json({ status: 'ok', usersInDb: userCount.count });
});

app.use((err, req, res, next) => {
  console.error(err);
  res.status(500).json({ error: 'Something went wrong' });
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Server running on http://localhost:${PORT}`));