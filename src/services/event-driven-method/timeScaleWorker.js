const { io } = require('socket.io-client');
const timescalePool = require('../../config/timescaleDb');

const socket = io('http://localhost:5003'); 

socket.on('connect', () => {
  console.log('Connected to WebSocket Server');
});

socket.on('snapshotData', async (data) => {
  console.log('Received snapshot data:', data);

  if (!data || data.length === 0) return;

  const client = await timescalePool.connect();

  try {
    await client.query('BEGIN');

    for (const row of data) {
      const query = `
        INSERT INTO snapshot_data (tagname, value, value_timestamp)
        VALUES ($1, $2, $3)
        ON CONFLICT (value_timestamp) DO NOTHING;
      `; //ON CONFLICT mencegah redudansi data
      
      await client.query(query, [row.Tagname, row.Value, row.Value_Timestamp]);
    }

    await client.query('COMMIT');
    console.log('Data inserted into TimescaleDB');
  } catch (err) {
    await client.query('ROLLBACK');
    console.error('Error inserting data into TimescaleDB:', err);
  } finally {
    client.release();
  }
});

socket.on('disconnect', () => {
  console.log('Disconnected from WebSocket Server');
});
