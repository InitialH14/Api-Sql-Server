const { Kafka } = require('kafkajs');
const { io } = require('socket.io-client');
const timescalePool = require('../../config/timescaleDb');

const kafka = new Kafka({
  clientId: 'scadaConsumer',
  brokers: ['localhost:9092'],
});

const consumer = kafka.consumer({ groupId: 'scada-group' });
const socket = io('http://localhost:5003');

socket.on('connect', () => console.log('Connected to WebSocket Server'));
socket.on('disconnect', () => console.log('Disconnected from WebSocket Server'));

const runConsumer = async () => {
  await consumer.connect();
  await consumer.subscribe({ topic: 'scada-buffer', fromBeginning: true });

  await consumer.run({
    eachMessage: async ({ message }) => {
      try {
        const rawData = message.value.toString();
        console.log('Received from Kafka:', rawData);

        let data;
        try {
          data = JSON.parse(rawData);
        } catch (jsonError) {
          console.error('JSON Parsing Error:', jsonError);
          return;
        }

        if (!Array.isArray(data)) {
          data = [data];
        }

        socket.emit('snapshotData', data);

        if (data.length === 0) return;

        const client = await timescalePool.connect();

        try {
          await client.query('BEGIN'); 

          for (const row of data) {
            let value = parseFloat(row.Value);
            if (isNaN(value)) {
              value = 0; 
            }

            const query = `
              INSERT INTO snapshot_data (tagname, value, value_timestamp)
              VALUES ($1, $2, $3)
              ON CONFLICT (value_timestamp) DO NOTHING;
            `;
            await client.query(query, [row.Tagname, value, row.Value_Timestamp]);
          }

          await client.query('COMMIT');
          console.log('Data inserted into TimescaleDB');
        } catch (err) {
          await client.query('ROLLBACK');
          console.error('Error inserting data into TimescaleDB:', err);
        } finally {
          client.release();
        }
      } catch (err) {
        console.error('Error processing Kafka message:', err);
      }
    },
  });
};

runConsumer().catch(console.error);
