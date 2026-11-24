const { Server } = require('socket.io');
const jwt = require('jsonwebtoken');
const config = require('./config');

/**
 * Real-time channels
 *  - queue:<branchId>   public   : token display refresh signal
 *  - beds               public   : bed board changes
 *  - amb:<ref>          public   : tracking of ONE ambulance request (client must know the reference)
 *  - ambulance          staff    : new emergency requests (requires JWT with role ambulance/branch-admin/super-admin)
 */
function initSocket(server, app) {
  const io = new Server(server, { cors: { origin: config.corsOrigins, credentials: true } });
  io.use((socket, next) => {
    const token = socket.handshake.auth?.token;
    if (token) { try { socket.user = jwt.verify(token, config.jwt.accessSecret); } catch { /* guest */ } }
    next();
  });
  io.on('connection', (socket) => {
    socket.on('queue:join', (branchId) => typeof branchId === 'string' && socket.join(`queue:${branchId.slice(0, 30)}`));
    socket.on('beds:join', () => socket.join('beds'));
    socket.on('track:ambulance', (ref) => typeof ref === 'string' && /^AMB-\d{5}$/.test(ref) && socket.join(`amb:${ref}`));
    socket.on('ambulance:join', () => {
      if (['ambulance', 'branch-admin', 'super-admin'].includes(socket.user?.role)) socket.join('ambulance');
    });
  });
  app.set('io', io);
  return io;
}
module.exports = { initSocket };
