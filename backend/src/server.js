const app = require('./app');
const config = require('./config');

// Railway (and most cloud platforms) inject PORT as an env variable.
// We MUST listen on 0.0.0.0 (not just localhost) for the service to be reachable.
const PORT = process.env.PORT || config.port || 3000;
const HOST = '0.0.0.0';

app.listen(PORT, HOST, () => {
  console.log(`
  ╔══════════════════════════════════════════════╗
  ║   Smart Checkout System — API Server         ║
  ║   Mode: ${config.nodeEnv.padEnd(36)}║
  ║   Port: ${String(PORT).padEnd(36)}║
  ║   Host: ${HOST.padEnd(36)}║
  ╚══════════════════════════════════════════════╝
  `);
});

