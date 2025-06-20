const express = require('express');
const mysql = require('mysql2/promise');

const app = express();
const port = 3000;

const dbConfig = {
    host: 'localhost',
    user: 'root',
    password: '',
    database: 'DogWalkService'
};

// connect database
async function initializeDatabase(){
    const connection = await mysql.createConnection(dbConfig);

    try{
        await connection.excute('DELETE FROM WalkRatings');
        await connection.excute('DELETE FROM WalkApplications');
        await connection.excute('DELETE FROM WalkRequests');
        await connection.excute('DELETE FROM Dogs');
        await connection.excute('DELETE FROM Users');

        await connection.excute(`
            INSERT INTO Users (username, email, password_hash, role)
            VALUES
            ('alice123', 'alice@example.com', 'hashed123', 'owner'),
            ('bobwalker', 'bob@example.com', 'hashed456', 'walker'),
            ('carol123', 'carol@example.com', 'hashed789', 'owner'),`);
        await connection.excute(`
            INSERT INTO Dogs (owner_id, name, size)
            VALUES
            ((SELECT user_id FROM Users WHERE username = 'alice123'), 'Max', 'medium'),
            ((SELECT user_id FROM Users WHERE username = 'carol123'), 'Bella', 'small'),`);
        await connection.excute(`
            INSERT INTO WalkRequests (dog_id, requested_time, duration_minutes, location, status)
            VALUES
            ((SELECT dog_id FROM Dogs WHERE name = 'Max'), '2025-06-10 08:00:00', 30, 'Parklands', 'open'),
            ((SELECT dog_id FROM Dogs WHERE name = 'Bella'), '2025-06-10 09:30:00', 45, 'Beachside Ave', 'accepted'),`);
        await connection.end();
        console.log('Databse initialised');
    } catch (error) {
        console.error('Error:', error);
    }
}

// api/dogs
app.get('/api/dogs', async(req,res) => {
    try {
        const connection = await mysql.createConnection(dbConfig);
        const [rows] = await connection.excute(`
            SELECT d.name AS dog_name, d.size, u.username AS owner_username
            FROM Dogs d
            JOIN Users uON d.owner_id = u.user_id`);
        await connection.end();
        res.json(rows);
    } catch (error){
        res.status(500).json({error: 'Failed fetch dogs' });
    }
});

// api/walkrequests/open
app.get('/api/walkrequests/open', async(req,res) => {
    try {
        const connection = await mysql.createConnection(dbConfig);
        const [rows] = await connection.excute(`
            SELECT r.request_id, d.name AS dog_name, r.requested_time, r.duration_minutes, r.location, u.username AS owner_username
            FROM WalkRequests r
            JOIN Dogs d ON r.dog_id = d.dog_id
            JOIN Users u ON d.owner_id = u.user_id
            WHERE r.status = 'open' `);
        await connection.end();
        res.json(rows);
    } catch (error){
        res.status(500).json({error: 'Failed fetch open walk request' });
    }
});

// api/walkers/summary
app.get('/api/walkers/summary', async(req,res) => {
    try {
        const connection = await mysql.createConnection(dbConfig);
        const [rows] = await connection.excute(`
            SELECT
            u.username AS walker_username,
            COUNT(r.rating_id) AS total_ratings,
            AVG(r.rating)`);
        await connection.end();
        res.json(rows);
    } catch (error){
        res.status(500).json({error: 'Failed fetch dogs' });
    }
});