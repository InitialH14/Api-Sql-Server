const { io } = require('socket.io-client');
const timescalePool = require('../../config/timescaleDb');

let isListenerAttached = false; 

const timeScaleWorker = async (port) => {
  if (isListenerAttached) return;
  isListenerAttached = true;

  const socket = io(`http://localhost:${port}`);

  socket.on('connect', () => {
    console.log(`Connected to WebSocket Server on port ${port}`);
  });

  socket.on('error', (err) => {
    console.error('WebSocket error:', err);
  });

  socket.on('disconnect', () => {
    console.log('Disconnected from WebSocket Server');
  });

  getData()
  
};

const getData = () => {
  socket.on('snapshotData', async (data) => {
    console.log('Received snapshot data:', data);

    if (!data || data.length === 0) return;

    const client = await timescalePool.connect();

    try {
      await client.query('BEGIN');

      const query = `
        INSERT INTO snapshots_data (tagname, value, value_timestamp)
        VALUES ${data.map((_, i) => `($${i * 3 + 1}, $${i * 3 + 2}, $${i * 3 + 3})`).join(', ')}
        ON CONFLICT (id, create_at) DO NOTHING;
      `;

      const values = data.flatMap(row => [row.Tagname, row.Value, row.Value_Timestamp]);

      await client.query(query, values);

      await client.query('COMMIT');
      console.log(`Inserted ${data.length} rows into TimescaleDB`);
    } catch (err) {
      await client.query('ROLLBACK');
      console.error('Error inserting data into TimescaleDB:', err);
    } finally {
      client.release();
    }
  });
}

module.exports = timeScaleWorker;
