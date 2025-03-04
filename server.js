const http = require('http');
const app = require('./src/app');
// const { initWebSocket } = require('./src/services/websocketService');

// const server = http.createServer(app);
// initWebSocket(server); 

require('./src/services/buffer-method/producer.js');
require('./src/services/buffer-method/consumer.js');

const PORT = process.env.PORT || 5004;
// server.listen(PORT, () => {
//   console.log(`Server running on port ${PORT}`);
// });
