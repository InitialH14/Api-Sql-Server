require('dotenv').config();

const { Pool } = require('pg');

const timescalePool = new Pool({
  user: process.env.DB_USER_TIMESCALE,
  host: process.env.DB_SERVER_TIMESCALE,
  database: process.env.DB_NAME_TIMESCALE,
  password: process.env.DB_PASS_TIMESCALE,
  port: process.env.PORT_TIMESCALE,
  max: 10, 
  idleTimeoutMillis: 30000, 
});

timescalePool.connect()
  .then(client => {
    console.log('Connected to TimescaleDB');
    client.release(); 
  })
  .catch(err => console.error('TimescaleDB connection error:', err));

module.exports = timescalePool;

