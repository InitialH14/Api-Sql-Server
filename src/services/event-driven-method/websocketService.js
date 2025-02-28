const { Server } = require('socket.io');
const poolPromise = require('../../config/db');

let io;

const initWebSocket = (server) => {
  io = new Server(server, {
    cors: { 
      origin: '*' 
    },
  });

  io.on('connection', (socket) => {
    console.log('Client connected:', socket.id);
    sendDataToClients();

    socket.on('disconnect', () => {
      console.log('Client disconnected:', socket.id);
    });
  });

  setInterval(sendDataToClients, 5000);
};

const sendDataToClients = async () => {
  try {
    const pool = await poolPromise;
    const request = pool.request();
  
    request.query(`
      SELECT Tagname, Value, Value_Timestamp
      FROM [TopView].[dbo].[Snapshot]
      WHERE Value_Timestamp > DATEADD(SECOND, -5, GETDATE()) 
    `, (err, result) => {
      if (err) {
        console.error('Error executing query:', err);
      } else {
        if (result.recordset.length > 0) {
          console.log('Sending data to clients:', result.recordset);
          io.emit('snapshotData', result.recordset);
        }
      }
    });

    console.log('Broadcasting data to WebSocket clients');
  } catch (err) {
    console.error('Error fetching data:', err);
  }
};

module.exports = { initWebSocket };
