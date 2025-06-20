const express = require('express');
const mysql = require('mysql2/promise');

const app = express();
const PORT = 3000;

// Database connection config
const dbConfig = {
  host: 'localhost',
  user: 'root',
  password: 'your_password',
  database: 'DogWalkService'
};

// Connect to database and insert test data
async function initializeDatabase() {
  const connection = await mysql.createConnection(dbConfig);

  try {
    // Clear and insert basic test data (safe for dev only)
    await connection.execute('DELETE FROM WalkRatings');
    await connection.execute('DELETE FROM WalkApplications');
    await connection.execute('DELETE FROM WalkRequests');
    await connection.execute('DELETE FROM Dogs');
    await connection.execute('DELETE FROM Users');

    await connection.execute(`
      INSERT INTO Users (username, email, password_hash, role)
      VALUES
      ('alice123', 'alice@example.com', 'hashed123', 'owner'),
      ('carol123', 'carol@example.com', 'hashed789', 'owner'),
      ('bobwalker', 'bob@example.com', 'hashed456', 'walker')
    `);

    await connection.execute(`
      INSERT INTO Dogs (owner_id, name, size)
      VALUES
      ((SELECT user_id FROM Users WHERE username='alice123'), 'Max', 'medium'),
      ((SELECT user_id FROM Users WHERE username='carol123'), 'Bella', 'small')
    `);

    await connection.execute(`
      INSERT INTO WalkRequests (dog_id, requested_time, duration_minutes, location, status)
      VALUES
      ((SELECT dog_id FROM Dogs WHERE name='Max'), '2025-06-10 08:00:00', 30, 'Parklands', 'open'),
      ((SELECT dog_id FROM Dogs WHERE name='Bella'), '2025-06-10 09:30:00', 45, 'Beachside Ave', 'accepted')
    `);

    await connection.end();
    console.log('Database initialized with test data.');
  } catch (error) {
    console.error('Error during database setup:', error);
  }
}

// Route: /api/dogs
app.get('/api/dogs', async (req, res) => {
  try {
    const connection = await mysql.createConnection(dbConfig);
    const [rows] = await connection.execute(`
      SELECT d.name AS dog_name, d.size, u.username AS owner_username
      FROM Dogs d
      JOIN Users u ON d.owner_id = u.user_id
    `);
    await connection.end();
    res.json(rows);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch dogs.' });
  }
});

// Route: /api/walkrequests/open
app.get('/api/walkrequests/open', async (req, res) => {
  try {
    const connection = await mysql.createConnection(dbConfig);
    const [rows] = await connection.execute(`
      SELECT r.request_id, d.name AS dog_name, r.requested_time, r.duration_minutes, r.location, u.username AS owner_username
      FROM WalkRequests r
      JOIN Dogs d ON r.dog_id = d.dog_id
      JOIN Users u ON d.owner_id = u.user_id
      WHERE r.status = 'open'
    `);
    await connection.end();
    res.json(rows);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch open walk requests.' });
  }
});

// Route: /api/walkers/summary
app.get('/api/walkers/summary', async (req, res) => {
  try {
    const connection = await mysql.createConnection(dbConfig);
    const [rows] = await connection.execute(`
      SELECT
        u.username AS walker_username,
        COUNT(r.rating_id) AS total_ratings,
        AVG(r.rating) AS average_rating,
        (
          SELECT COUNT(*)
          FROM WalkRequests wr
          JOIN WalkApplications wa ON wr.request_id = wa.request_id
          WHERE wa.walker_id = u.user_id AND wr.status = 'completed'
        ) AS completed_walks
      FROM Users u
      LEFT JOIN WalkRatings r ON u.user_id = r.walker_id
      WHERE u.role = 'walker'
      GROUP BY u.user_id
    `);
    await connection.end();
    res.json(rows);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch walkers summary.' });
  }
});

// Start server and initialize DB
app.listen(PORT, async () => {
  await initializeDatabase();
  console.log(`Server running at http://localhost:${PORT}`);
});
