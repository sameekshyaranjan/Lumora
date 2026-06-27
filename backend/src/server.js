const { buildApp } = require('./app');
const env = require('./config/env');

const app = buildApp();
const server = app.listen(env.port, () => {
  console.log(`[server] listening on http://localhost:${env.port} (${env.nodeEnv})`);
});

process.on('SIGTERM', () => server.close(() => process.exit(0)));

module.exports = server;
