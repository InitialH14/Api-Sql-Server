require('dotenv').config();
const express = require('express');
const cors = require('cors');
const snapshotRoutes = require('./routes/snapshotRoute');

const app = express();
app.use(express.json());
app.use(cors());
app.use('/api', snapshotRoutes);

module.exports = app;