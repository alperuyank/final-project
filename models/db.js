
const { Pool } = require('pg');

const dbUsername = process.env.DB_USERNAME;
const dbPassword = process.env.DB_PASSWORD;
const dbName = process.env.DB_NAME;
const dbHost = process.env.DB_HOST;
const dbPort = process.env.DB_PORT;

const pool = new Pool({
  user: dbUsername,
  password: dbPassword,
  host: dbHost,
  database: dbName,
  port: dbPort,
});

module.exports = {
  query: (text, params) => pool.query(text, params),
};