const express = require('express');
const app = require('../backend/src/app');

const server = express();
server.use('/api', app);

module.exports = server;
