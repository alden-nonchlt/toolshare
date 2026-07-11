require('dotenv').config();
const bcrypt = require('bcrypt');
const db = require('./src/db');

async function seed() {
  const passwordHash = await bcrypt.hash('demo12345', 10);
  const users = [
    { name: 'Alice Johnson', email: 'alice@toolshare.demo', role: 'user' },
    { name: 'Bob Martinez', email: 'bob@toolshare.demo', role: 'user' },
    { name: 'Casey Admin', email: 'admin@toolshare.demo', role: 'admin' },
  ];

  const insertAll = db.transaction(() => {
    db.prepare('DELETE FROM reviews').run();
    db.prepare('DELETE FROM requests').run();
    db.prepare('DELETE FROM listings').run();
    db.prepare('DELETE FROM users').run();
    db.prepare("DELETE FROM sqlite_sequence WHERE name IN ('users', 'listings', 'requests', 'reviews')").run();

    const addUser = db.prepare('INSERT INTO users (name, email, password_hash, role, is_active) VALUES (?, ?, ?, ?, 1)');
    const userIds = {};
    for (const user of users) userIds[user.email] = Number(addUser.run(user.name, user.email, passwordHash, user.role).lastInsertRowid);

    const addListing = db.prepare(`
      INSERT INTO listings (owner_id, title, description, category, condition, photo_url, is_available, status)
      VALUES (?, ?, ?, ?, ?, ?, ?, 'active')
    `);
    const listings = [
      [userIds['alice@toolshare.demo'], 'Cordless Drill', '18V drill with two batteries and a charger.', 'Power Tools', 'Good', null, 1],
      [userIds['alice@toolshare.demo'], 'Orbital Sander', 'Compact finishing sander for wood projects.', 'Power Tools', 'Like new', null, 1],
      [userIds['alice@toolshare.demo'], 'Garden Pruner Set', 'Loppers, hand pruners, and work gloves.', 'Garden', 'Good', null, 1],
      [userIds['bob@toolshare.demo'], 'Extension Ladder', '20-foot aluminum extension ladder.', 'Home Improvement', 'Good', null, 0],
      [userIds['bob@toolshare.demo'], 'Socket Wrench Set', 'Metric and imperial sockets in a hard case.', 'Hand Tools', 'Excellent', null, 1],
      [userIds['bob@toolshare.demo'], 'Pressure Washer', 'Electric pressure washer with patio attachment.', 'Garden', 'Fair', null, 1],
      [userIds['admin@toolshare.demo'], 'Circular Saw', '7 1/4 inch saw with a guide rail.', 'Power Tools', 'Good', null, 1],
      [userIds['admin@toolshare.demo'], 'Paint Roller Kit', 'Rollers, trays, brushes, and drop cloths.', 'Home Improvement', 'Like new', null, 1],
      [userIds['admin@toolshare.demo'], 'Stud Finder', 'Electronic stud finder with wire detection.', 'Hand Tools', 'Excellent', null, 1],
    ];
    const listingIds = listings.map((listing) => Number(addListing.run(...listing).lastInsertRowid));

    const addRequest = db.prepare(`
      INSERT INTO requests (listing_id, requester_id, status, requested_at, updated_at)
      VALUES (?, ?, ?, CURRENT_TIMESTAMP, CASE WHEN ? = 'pending' THEN NULL ELSE CURRENT_TIMESTAMP END)
    `);
    addRequest.run(listingIds[0], userIds['bob@toolshare.demo'], 'pending', 'pending');
    addRequest.run(listingIds[3], userIds['alice@toolshare.demo'], 'approved', 'approved');
    addRequest.run(listingIds[1], userIds['bob@toolshare.demo'], 'returned', 'returned');
    addRequest.run(listingIds[6], userIds['alice@toolshare.demo'], 'rejected', 'rejected');
  });

  insertAll();
  console.log('Seed complete: 3 users, 9 listings, and 4 lifecycle requests.');
  console.log('Demo password for every user: demo12345');
}

seed().catch((error) => {
  console.error('Seeding failed:', error);
  process.exitCode = 1;
});
