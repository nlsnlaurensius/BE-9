require("dotenv").config();

const { Pool } = require("pg");

const pool = new Pool({
  connectionString: process.env.PG_CONNECTION_STRING,
  ssl: {
    rejectUnauthorized: false,
  },
  max: 20, 
  idleTimeoutMillis: 30000, 
});

const connect = async () => {
  try {
    await pool.connect();
    console.log("Connected to the database");
  } catch (error) {
    console.error("Error connecting to the database", error);
  }
};

connect();

const query = async (text, params) => {
  let client;
  try {
    client = await pool.connect();
    const res = await client.query(text, params);
    return res;
  } catch (error) {
    console.error("Error executing query", error);
    throw error; 
  } finally {
    if (client) {
      client.release(); 
    }
  }
};

module.exports = { query };
