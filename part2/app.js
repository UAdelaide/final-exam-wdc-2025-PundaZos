const express = require('express');
const path = require('path');
require('dotenv').config();

const app = express();

const db = require('./models/db')

//Login support
const session = require('express-session');
app.use(session({
  secret: 'dogsecret',
  resave: false,
  saveUninitialized: true,
}));

// Middleware
app.use(express.json());
app.use(express.static(path.join(__dirname, '/public')));

// Routes
const walkRoutes = require('./routes/walkRoutes');
const userRoutes = require('./routes/userRoutes');

app.use('/api/walks', walkRoutes);
app.use('/api/users', userRoutes);

app.get('/api/dogs', async(req,res) => {
    try {
      if (req.query.owner) {
        const [dogs]=await db.execute
      }
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

// Export the app instead of listening here
module.exports = app;