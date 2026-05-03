const express = require('express');
const http = require('http');
const { Server } = require('socket.io');
const os = require('os');
const QRCode = require('qrcode');

const PORT = 4567;
const ADMIN_PASSWORD = 'oylama2025';

const app = express();
const server = http.createServer(app);
const io = new Server(server);

app.get('/admin.html', (req, res, next) => {
  const auth = req.headers['authorization'];
  if (auth) {
    const b64 = auth.split(' ')[1] || '';
    const [, pass] = Buffer.from(b64, 'base64').toString().split(':');
    if (pass === ADMIN_PASSWORD) return next();
  }
  res.set('WWW-Authenticate', 'Basic realm="Admin"');
  res.status(401).send('Yetkisiz erişim.');
});

app.use(express.static('public'));

const projects = [];
let votingOpen = false;
const votes = {};

function getLocalIP() {
  const interfaces = os.networkInterfaces();
  for (const name of Object.keys(interfaces)) {
    for (const iface of interfaces[name]) {
      if (iface.family === 'IPv4' && !iface.internal) return iface.address;
    }
  }
  return 'localhost';
}

function getResults() {
  return projects.map(p => {
    const projectVotes = votes[p.id] || [];
    const count = projectVotes.length;
    if (count === 0) {
      return { ...p, avg: { gorsel: 0, senaryo: 0, yaraticilik: 0, toplam: 0 }, count: 0 };
    }
    const sum = { gorsel: 0, senaryo: 0, yaraticilik: 0 };
    projectVotes.forEach(v => {
      sum.gorsel += v.gorsel;
      sum.senaryo += v.senaryo;
      sum.yaraticilik += v.yaraticilik;
    });
    const avg = {
      gorsel: +(sum.gorsel / count).toFixed(1),
      senaryo: +(sum.senaryo / count).toFixed(1),
      yaraticilik: +(sum.yaraticilik / count).toFixed(1),
      toplam: +((sum.gorsel + sum.senaryo + sum.yaraticilik) / (count * 3)).toFixed(1)
    };
    return { ...p, avg, count };
  }).sort((a, b) => b.avg.toplam - a.avg.toplam);
}

io.on('connection', (socket) => {
  socket.emit('state', {
    projects,
    votingOpen,
    results: getResults()
  });

  socket.on('add-project', (name) => {
    if (!name || !name.trim()) return;
    const id = Date.now().toString(36) + Math.random().toString(36).slice(2, 6);
    const project = { id, name: name.trim() };
    projects.push(project);
    votes[project.id] = [];
    io.emit('state', { projects, votingOpen, results: getResults() });
  });

  socket.on('remove-project', (id) => {
    const idx = projects.findIndex(p => p.id === id);
    if (idx !== -1) {
      projects.splice(idx, 1);
      delete votes[id];
      io.emit('state', { projects, votingOpen, results: getResults() });
    }
  });

  socket.on('toggle-voting', () => {
    votingOpen = !votingOpen;
    io.emit('state', { projects, votingOpen, results: getResults() });
  });

  socket.on('vote', (data) => {
    if (!votingOpen) return socket.emit('vote-error', 'Oylama şu anda kapalı.');
    const project = projects.find(p => p.id === data.projectId);
    if (!project) return socket.emit('vote-error', 'Proje bulunamadı.');
    const projectVotes = votes[data.projectId] || [];
    const alreadyVoted = projectVotes.some(v => v.odaId === socket.id);
    if (alreadyVoted) return socket.emit('vote-error', 'Bu projeye zaten oy verdiniz.');
    projectVotes.push({
      odaId: socket.id,
      gorsel: Math.min(10, Math.max(1, parseInt(data.gorsel) || 1)),
      senaryo: Math.min(10, Math.max(1, parseInt(data.senaryo) || 1)),
      yaraticilik: Math.min(10, Math.max(1, parseInt(data.yaraticilik) || 1))
    });
    votes[data.projectId] = projectVotes;
    socket.emit('vote-success', 'Oyunuz kaydedildi!');
    io.emit('state', { projects, votingOpen, results: getResults() });
  });

  socket.on('reset-votes', () => {
    Object.keys(votes).forEach(k => votes[k] = []);
    io.emit('state', { projects, votingOpen, results: getResults() });
  });
});

app.get('/api/voteurl', (req, res) => {
  const ip = getLocalIP();
  const url = `http://${ip}:${PORT}/vote.html`;
  res.json({ url });
});

app.get('/api/qr', async (req, res) => {
  const ip = getLocalIP();
  const url = `http://${ip}:${PORT}/vote.html`;
  try {
    const dataUrl = await QRCode.toDataURL(url, { width: 300, margin: 2 });
    const base64 = dataUrl.replace(/^data:image\/png;base64,/, '');
    const buf = Buffer.from(base64, 'base64');
    res.set('Content-Type', 'image/png');
    res.send(buf);
  } catch (e) {
    console.error('QR hatası:', e);
    res.status(500).send('QR oluşturulamadı');
  }
});

server.listen(PORT, () => {
  const ip = getLocalIP();
  console.log(`Sunucu çalışıyor:`);
  console.log(`  Admin:  http://localhost:${PORT}/admin.html`);
  console.log(`  Oylama: http://${ip}:${PORT}/vote.html`);
});
