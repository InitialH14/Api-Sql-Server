require('dotenv').config();

const http = require('http');
const express = require('express');
const cors = require('cors');
const { initWebSocket } = require('./services/websocket-method/websocketService');
const snapshotRoutes = require('./routes/snapshotRoute');

const app = express();
app.use(express.json());
app.use(cors());

const server = http.createServer(app);

const realtimeStream = (time) => {
    initWebSocket(server, time); 

    const PORT = process.env.PORT || 5004;
    server.listen(PORT, () => {
        console.log(`Server running on port ${PORT}`);
    });
}

const requestResponse = () => {
    app.use('/api', snapshotRoutes);
}

module.exports = {realtimeStream, requestResponse};