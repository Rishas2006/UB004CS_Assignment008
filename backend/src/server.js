const http = require('http');
const config = require('./config');
const app = require('./app');
const { pool } = require('./db');
const { initSocket } = require('./socket');
const { startJobs } = require('./jobs/cron');
const { verifyMail } = require('./services/mailer');

const server = http.createServer(app);
initSocket(server, app);
if (config.env !== 'test') { startJobs(); verifyMail(); }

server.listen(config.port, () => console.log(`RH HMS API listening on :${config.port} (${config.env})`));

const shutdown = (sig) => {
  console.log(`${sig} received - shutting down`);
  server.close(async () => { await pool.end(); process.exit(0); });
  setTimeout(() => process.exit(1), 10_000).unref();
};
['SIGINT', 'SIGTERM'].forEach((s) => process.on(s, () => shutdown(s)));
