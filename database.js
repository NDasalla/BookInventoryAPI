const { Pool } = require("pg");
require("dotenv").config();

const pool = new Pool({
  user: process.env.DB_USER,
  host: process.env.DB_HOST,
  database: process.env.DB_NAME,
  password: process.env.DB_PASSWORD,
  port: process.env.DB_PORT,
});

const createTableQuery = `
  CREATE TABLE IF NOT EXISTS job_applications(
    id SERIAL PRIMARY KEY,
    title VARCHAR(100) NOT NULL,
    author VARCHAR(100),
    genre VARCHAR(100),
    language VARCHAR(100),
    publicationDate DATE,
    pages INTEGER
  );
`;

const createJobAppsTable = async () => {
  try {
    await pool.query(createTableQuery);
    console.log("Creating table was successful");
  } catch (error) {
    console.error("An error occurred while creating the table", error.stack);
  }
};

createJobAppsTable();

module.exports = {
  query: (text, params, callback) => {
    console.log("QUERY:", text, params || "");
    return pool.query(text, params, callback);
  },
};
