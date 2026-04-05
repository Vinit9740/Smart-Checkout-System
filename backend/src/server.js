const app = require('./app');
const config = require('./config');

const PORT = config.port;

app.listen(PORT, () => {
  console.log(`
  ╔══════════════════════════════════════════════╗
  ║   Smart Checkout System — API Server         ║
  ║   Mode: ${config.nodeEnv.padEnd(36)}║
  ║   Port: ${String(PORT).padEnd(36)}║
  ║   URL:  http://localhost:${String(PORT).padEnd(19)}║
  ╚══════════════════════════════════════════════╝
  `);
});
