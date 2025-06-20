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
    const connection = await mysql.createConnection(dbconfig);

    try{
        await connection.excute('DELETE FROM WalkRatings');
        await connection.excute('DELETE FROM WalkApplications');
        await connection.excute('DELETE FROM WalkRequests');
        await connection.excute('DELETE FROM Dogs');
        await connection.excute('DELETE FROM Users');

        await co
    }
}