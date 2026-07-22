const express = require('express');
const apiApp = require('./app');
const config = require('./config');
const db = require('./config/db');

// Railway (and most cloud platforms) inject PORT as an env variable.
// We MUST listen on 0.0.0.0 (not just localhost) for the service to be reachable.
const PORT = Number(process.env.PORT || config.port || 3000);
const HOST = '0.0.0.0';

function startServer(port = PORT, attempts = 0) {
  try {
    const app = express();
    app.use('/api', apiApp);

    const server = app.listen(port, HOST, () => {
      console.log(`
      ╔══════════════════════════════════════════════╗
      ║   Smart Checkout System — API Server         ║
      ║   Mode: ${config.nodeEnv.padEnd(36)}║
      ║   Port: ${String(port).padEnd(36)}║
      ║   Host: ${HOST.padEnd(36)}║
      ╚══════════════════════════════════════════════╝
      `);
    });

    server.on('error', (error) => {
      if (error.code === 'EADDRINUSE' && attempts < 5) {
        const nextPort = port + 1;
        console.warn(`[SERVER] Port ${port} is already in use. Trying ${nextPort} instead.`);
        server.close(() => {
          startServer(nextPort, attempts + 1);
        });
        return;
      }

      console.error('[SERVER] Failed to start the server:', error.message);
      process.exit(1);
    });
  } catch (error) {
    console.error('[SERVER] Startup failed:', error.message);
    process.exit(1);
  }
}

async function boot() {
  try {
    await db.initializeDatabase();
  } catch (error) {
    console.warn('[SERVER] Continuing with startup despite database initialization failure.');
  }

  startServer();
}

boot();

