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
        await connection.excute
        await connection.excute
        await connection.excute
        await connection.excute
        await connection.excute
        await connection.excute
        await connection.excute
    }
}