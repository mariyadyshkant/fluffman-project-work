// Configurazione per Supabase (PostgreSQL)
import pkg from "pg";
import dotenv from 'dotenv';
const { Pool } = pkg;
dotenv.config({ path: '../.env' });
const pool = new Pool({
    connectionString: process.env.DATABASE_URL,
    ssl: { rejectUnauthorized: false }
});
export default pool;

/*
// Configurazione per MySQL
import mysql from 'mysql2/promise';
// require('dotenv').config({ path: '../.env' });
import dotenv from 'dotenv';
dotenv.config({ path: '../.env' });
const pool = mysql.createPool({
    host: process.env.DB_HOST,
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    database: process.env.DB_DATABASE,
});
export default pool;
*/