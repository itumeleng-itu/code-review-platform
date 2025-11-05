// src/db/db.ts
import { Pool } from 'pg';
import * as dotenv from 'dotenv';

// Load environment variables
dotenv.config();

const pool = new Pool({
  user: process.env.DB_USER,
  host: process.env.DB_HOST,
  database: process.env.DB_NAME,
  password: process.env.DB_PASSWORD,
  port: parseInt(process.env.DB_PORT || "5432"),
});


export const query = (text: string, params?:any[])=> {
    console.log('testing:', text, params);
    return pool.query(text, params);
}

export const dbConnection = async () =>{
    try{
        const client = await pool.connect();
        console.log("Database connected");
        client.release();
    }
    catch(error){
        console.error("Cannot connect to database", error);
        //process.exit(1);
        
    }
}