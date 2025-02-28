require('dotenv').config();
const { Kafka } = require('kafkajs');
const poolPromise = require('../../config/db'); 

const kafka = new Kafka({ 
  clientId: 'snapshotProducer', 
  brokers: ['localhost:9092'] 
});

const producer = kafka.producer();

async function fetchDataAndSendToKafka() {
  try {
    const pool = await poolPromise; 
    if (!pool) throw new Error('Database connection is not available');

    const result = await pool.request().query(`
      SELECT TOP 100 Tagname, Value, Value_Timestamp
      FROM [TopView].[dbo].[Snapshot]
    `);

    for (let row of result.recordset) {
      await producer.send({
        topic: 'scada-buffer',
        messages: [{ 
          value: JSON.stringify(row) 
        }],
        
      });
      console.log('Sent to Kafka:', row);
    }
  } catch (err) {
    console.error('Error fetching data:', err);
  }
}

async function startProducer() {
  try {
    await producer.connect();
    console.log('Kafka Producer connected');
    
    fetchDataAndSendToKafka();
    
    setInterval(fetchDataAndSendToKafka, 5000);
  } catch (err) {
    console.error('Failed to connect Kafka Producer:', err);
  }
}

startProducer();
