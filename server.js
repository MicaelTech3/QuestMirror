const express = require('express');
const http = require('http');
const { Server } = require('socket.io');
const path = require('path');
const os = require('os');

const app = express();
const server = http.createServer(app);
const io = new Server(server, {
  cors: { origin: '*' }
});

app.use(express.static(path.join(__dirname, 'public')));

// Rota para descobrir o IP do servidor automaticamente
app.get('/config', (req, res) => {
  const interfaces = os.networkInterfaces();
  let ip = 'localhost';
  for (const name of Object.keys(interfaces)) {
    for (const iface of interfaces[name]) {
      if (iface.family === 'IPv4' && !iface.internal) {
        ip = iface.address;
        break;
      }
    }
  }
  res.json({ serverIp: ip, port: PORT });
});

// Estado: senders registrados e viewers
const senders = new Map();   // socketId -> { questId, socket }
const viewers = new Set();   // socketIds dos viewers

io.on('connection', (socket) => {
  console.log(`[+] Conectado: ${socket.id}`);

  // ── SENDER (Quest) ──────────────────────────────────────────────
  socket.on('register-sender', ({ questId }) => {
    senders.set(socket.id, { questId, socketId: socket.id });
    console.log(`[Quest ${questId}] Sender registrado (${socket.id})`);
    broadcastSenderList();
  });

  // Viewer solicita offer de um sender específico
  socket.on('request-offer-from-viewer', ({ senderSocketId, viewerSocketId }) => {
    console.log(`[Viewer ${viewerSocketId.substring(0,8)}] Pedindo offer do sender ${senderSocketId.substring(0,8)}`);
    io.to(senderSocketId).emit('request-offer', { viewerSocketId });
  });

  // Offer vinda do Quest → repassa ao viewer específico
  socket.on('webrtc-offer', ({ questId, offer, targetViewer }) => {
    console.log(`[Quest ${questId}] Offer → viewer ${targetViewer ? targetViewer.substring(0,8) : 'todos'}`);
    if (targetViewer) {
      io.to(targetViewer).emit('webrtc-offer', { questId, offer, senderSocketId: socket.id });
    } else {
      viewers.forEach(viewerId => {
        io.to(viewerId).emit('webrtc-offer', { questId, offer, senderSocketId: socket.id });
      });
    }
  });

  // Answer vinda do viewer → repassa ao Quest correto
  socket.on('webrtc-answer', ({ senderSocketId, answer, viewerSocketId }) => {
    console.log(`[Viewer] Answer → sender ${senderSocketId.substring(0,8)}`);
    io.to(senderSocketId).emit('webrtc-answer', { answer, viewerSocketId: viewerSocketId || socket.id });
  });

  // ICE candidates: Quest → viewer específico
  socket.on('ice-candidate-sender', ({ questId, candidate, targetViewer }) => {
    if (targetViewer) {
      io.to(targetViewer).emit('ice-candidate-sender', { questId, candidate, senderSocketId: socket.id });
    } else {
      viewers.forEach(viewerId => {
        io.to(viewerId).emit('ice-candidate-sender', { questId, candidate, senderSocketId: socket.id });
      });
    }
  });

  // ICE candidates: viewer → Quest
  socket.on('ice-candidate-viewer', ({ senderSocketId, candidate }) => {
    io.to(senderSocketId).emit('ice-candidate-viewer', { candidate, viewerSocketId: socket.id });
  });

  // ── VIEWER (Chromecast / TV) ────────────────────────────────────
  socket.on('register-viewer', () => {
    viewers.add(socket.id);
    console.log(`[Viewer] Registrado (${socket.id})`);
    // Envia lista atual de senders
    socket.emit('sender-list', getSenderList());
  });

  // ── DESCONEXÃO ──────────────────────────────────────────────────
  socket.on('disconnect', () => {
    if (senders.has(socket.id)) {
      const { questId } = senders.get(socket.id);
      senders.delete(socket.id);
      console.log(`[-] Quest ${questId} desconectado`);
      broadcastSenderList();
      // Notifica viewers que esse sender sumiu
      viewers.forEach(viewerId => {
        io.to(viewerId).emit('sender-disconnected', { senderSocketId: socket.id });
      });
    }
    if (viewers.has(socket.id)) {
      viewers.delete(socket.id);
      // Notifica senders que esse viewer sumiu
      senders.forEach((s) => {
        io.to(s.socketId).emit('viewer-disconnected', { viewerSocketId: socket.id });
      });
      console.log(`[-] Viewer desconectado`);
    }
  });
});

function getSenderList() {
  return Array.from(senders.values()).map(s => ({
    socketId: s.socketId,
    questId: s.questId
  }));
}

function broadcastSenderList() {
  const list = getSenderList();
  viewers.forEach(viewerId => {
    io.to(viewerId).emit('sender-list', list);
  });
  console.log(`[Server] Senders ativos: ${list.map(s => 'Quest' + s.questId).join(', ') || 'nenhum'}`);
}

const PORT = process.env.PORT || 3000;
server.listen(PORT, '0.0.0.0', () => {
  console.log(`\n✅ Servidor rodando em http://0.0.0.0:${PORT}`);
  console.log(`📡 Abra no Quest: http://<IP_DO_SERVIDOR>:${PORT}/sender.html`);
  console.log(`📺 Abra no Chromecast: http://<IP_DO_SERVIDOR>:${PORT}/viewer.html\n`);
});