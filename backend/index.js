const express = require('express');
const cors = require('cors');
const http = require('http');
const { Server } = require('socket.io');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');
const { initDB } = require('./db');

const JWT_SECRET = process.env.JWT_SECRET || 'mediqueue-super-secret-jwt-key-2026';
const PORT = process.env.PORT || 5000;

const app = express();
const server = http.createServer(app);
const io = new Server(server, {
  cors: {
    origin: '*',
    methods: ['GET', 'POST']
  }
});

app.use(cors());
app.use(express.json());

// WebSocket Connection Handler
io.on('connection', (socket) => {
  console.log('Client connected to real-time queue socket:', socket.id);
  
  socket.on('disconnect', () => {
    console.log('Client disconnected:', socket.id);
  });
});

// Helper function to broadcast queue updates
const broadcastQueueUpdate = (data) => {
  io.emit('QUEUE_UPDATED', data);
};

// Authentication Middleware
const authenticateToken = (req, res, next) => {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];

  if (!token) {
    return res.status(401).json({ error: 'Access denied. No token provided.' });
  }

  jwt.verify(token, JWT_SECRET, (err, user) => {
    if (err) {
      return res.status(403).json({ error: 'Invalid or expired token.' });
    }
    req.user = user;
    next();
  });
};

// Optional auth helper (doesn't reject if unauthenticated)
const optionalAuth = (req, res, next) => {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];
  if (token) {
    jwt.verify(token, JWT_SECRET, (err, user) => {
      if (!err) req.user = user;
      next();
    });
  } else {
    next();
  }
};

/* ================= AUTHENTICATION ROUTES ================= */

// Register a new user
app.post('/api/auth/register', async (req, res) => {
  try {
    const { name, email, password, role = 'patient', doctorId = null } = req.body;
    if (!name || !email || !password) {
      return res.status(400).json({ error: 'Name, email, and password are required.' });
    }

    const db = await initDB();
    const existing = await db.get('SELECT id FROM users WHERE email = ?', [email.toLowerCase()]);
    if (existing) {
      return res.status(409).json({ error: 'An account with this email already exists.' });
    }

    const hashedPassword = await bcrypt.hash(password, 10);
    const result = await db.run(
      'INSERT INTO users (name, email, password, role, doctorId) VALUES (?, ?, ?, ?, ?)',
      [name, email.toLowerCase(), hashedPassword, role, doctorId]
    );

    const user = {
      id: result.lastID,
      name,
      email: email.toLowerCase(),
      role,
      doctorId
    };

    const token = jwt.sign(user, JWT_SECRET, { expiresIn: '7d' });
    res.status(201).json({ token, user });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Login
app.post('/api/auth/login', async (req, res) => {
  try {
    const { email, password } = req.body;
    if (!email || !password) {
      return res.status(400).json({ error: 'Email and password are required.' });
    }

    const db = await initDB();
    const userInDb = await db.get('SELECT * FROM users WHERE email = ?', [email.toLowerCase()]);
    if (!userInDb) {
      return res.status(401).json({ error: 'Invalid email or password.' });
    }

    const isMatch = await bcrypt.compare(password, userInDb.password);
    if (!isMatch) {
      return res.status(401).json({ error: 'Invalid email or password.' });
    }

    const user = {
      id: userInDb.id,
      name: userInDb.name,
      email: userInDb.email,
      role: userInDb.role,
      doctorId: userInDb.doctorId
    };

    const token = jwt.sign(user, JWT_SECRET, { expiresIn: '7d' });
    res.json({ token, user });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Current user profile
app.get('/api/auth/me', authenticateToken, async (req, res) => {
  try {
    const db = await initDB();
    const userInDb = await db.get('SELECT id, name, email, role, doctorId FROM users WHERE id = ?', [req.user.id]);
    if (!userInDb) {
      return res.status(404).json({ error: 'User not found.' });
    }
    res.json({ user: userInDb });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

/* ================= HOSPITAL & QUEUE ROUTES ================= */

// Get all hospital branches
app.get('/api/branches', async (req, res) => {
  try {
    const db = await initDB();
    const branches = await db.all('SELECT * FROM branches');
    res.json(branches);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Get all departments
app.get('/api/departments', async (req, res) => {
  try {
    const db = await initDB();
    const departments = await db.all('SELECT * FROM departments');
    res.json(departments);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Get all doctors
app.get('/api/doctors', async (req, res) => {
  try {
    const db = await initDB();
    const doctors = await db.all('SELECT * FROM doctors');
    res.json(doctors);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Book a new token
app.post('/api/tokens/book', optionalAuth, async (req, res) => {
  try {
    const { doctorId, patientName, isEmergency } = req.body;
    const db = await initDB();
    const doctor = await db.get('SELECT * FROM doctors WHERE id = ?', [doctorId || 'doc-1']);

    if (!doctor) {
      return res.status(404).json({ error: 'Doctor not found' });
    }

    const effectivePatientName = req.user ? req.user.name : (patientName || 'Alex Morgan');
    const prefix = doctor.currentToken.split('-')[0] || 'A';
    const currentNum = parseInt(doctor.currentToken.split('-')[1]) || 100;
    const randomTokenNum = `${prefix}-${currentNum + doctor.queueLength + 1}`;
    const bookingTime = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    const positionInQueue = isEmergency ? 1 : doctor.queueLength + 1;
    const estimatedWaitMinutes = isEmergency ? doctor.avgConsultTimeMinutes : (doctor.queueLength + 1) * doctor.avgConsultTimeMinutes;
    const aiFactors = JSON.stringify([isEmergency ? 'Emergency Express Priority' : 'Regular Booking', `Avg ${doctor.avgConsultTimeMinutes} min/patient`]);
    const qrCodeUrl = `https://api.qrserver.com/v1/create-qr-code/?size=180x180&data=MEDIQUEUE-${randomTokenNum}-${encodeURIComponent(effectivePatientName)}`;
    const status = isEmergency ? 'Express Queue' : 'Waiting';

    const result = await db.run(`
      INSERT INTO tokens 
      (tokenNumber, patientName, doctorName, specialty, room, department, bookingTime, currentlyServing, positionInQueue, estimatedWaitMinutes, aiConfidenceScore, aiFactors, status, qrCodeUrl)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `, [
      randomTokenNum,
      effectivePatientName,
      doctor.name,
      doctor.specialty,
      doctor.room,
      doctor.specialty,
      bookingTime,
      doctor.currentToken,
      positionInQueue,
      estimatedWaitMinutes,
      '96% High Accuracy',
      aiFactors,
      status,
      qrCodeUrl
    ]);

    await db.run('UPDATE doctors SET queueLength = queueLength + 1 WHERE id = ?', [doctor.id]);

    const newToken = {
      id: result.lastID,
      tokenNumber: randomTokenNum,
      patientName: effectivePatientName,
      doctorName: doctor.name,
      specialty: doctor.specialty,
      room: doctor.room,
      department: doctor.specialty,
      bookingTime,
      currentlyServing: doctor.currentToken,
      positionInQueue,
      estimatedWaitMinutes,
      aiConfidenceScore: '96% High Accuracy',
      aiFactors: JSON.parse(aiFactors),
      status,
      qrCodeUrl
    };

    // Real-time WebSocket emission
    broadcastQueueUpdate({ type: 'NEW_BOOKING', payload: newToken });

    res.status(201).json(newToken);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Get a specific token by token number
app.get('/api/tokens/:tokenNumber', async (req, res) => {
  try {
    const db = await initDB();
    const token = await db.get('SELECT * FROM tokens WHERE tokenNumber = ?', [req.params.tokenNumber]);
    if (!token) {
      return res.status(404).json({ error: 'Token not found' });
    }

    const doctor = await db.get('SELECT * FROM doctors WHERE name = ?', [token.doctorName]);
    if (doctor) {
      token.currentlyServing = doctor.currentToken;
      const currentNum = parseInt(doctor.currentToken.split('-')[1]);
      const userNum = parseInt(token.tokenNumber.split('-')[1]);
      token.positionInQueue = Math.max(0, userNum - currentNum);
      token.estimatedWaitMinutes = token.positionInQueue * doctor.avgConsultTimeMinutes;
      token.status = token.positionInQueue === 0 ? 'Your Turn Now!' : token.positionInQueue === 1 ? 'Next Up!' : token.status;
    }

    if (typeof token.aiFactors === 'string') {
      token.aiFactors = JSON.parse(token.aiFactors);
    }

    res.json(token);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Advance queue for a doctor
app.post('/api/doctors/:doctorId/advance', optionalAuth, async (req, res) => {
  try {
    const db = await initDB();
    const doctor = await db.get('SELECT * FROM doctors WHERE id = ?', [req.params.doctorId]);
    if (!doctor) {
      return res.status(404).json({ error: 'Doctor not found' });
    }

    const prefix = doctor.currentToken.split('-')[0];
    let currentNum = parseInt(doctor.currentToken.split('-')[1]);
    currentNum += 1;
    const newServingToken = `${prefix}-${currentNum}`;
    const newQueueLength = Math.max(0, doctor.queueLength - 1);

    await db.run('UPDATE doctors SET currentToken = ?, queueLength = ? WHERE id = ?', [newServingToken, newQueueLength, doctor.id]);

    const updatedDoctor = await db.get('SELECT * FROM doctors WHERE id = ?', [doctor.id]);

    // Broadcast Real-time Queue Advance Event
    broadcastQueueUpdate({ type: 'QUEUE_ADVANCED', payload: updatedDoctor });

    res.json(updatedDoctor);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Kiosk scan token
app.post('/api/tokens/:tokenNumber/scan', async (req, res) => {
  try {
    const db = await initDB();
    await db.run('UPDATE tokens SET status = ? WHERE tokenNumber = ?', ['Checked-in at Kiosk', req.params.tokenNumber]);
    
    const token = await db.get('SELECT * FROM tokens WHERE tokenNumber = ?', [req.params.tokenNumber]);
    if (token && typeof token.aiFactors === 'string') {
      token.aiFactors = JSON.parse(token.aiFactors);
    }

    // Broadcast Real-time Kiosk Scan Event
    broadcastQueueUpdate({ type: 'TOKEN_SCANNED', payload: token });

    res.json(token);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Get all tokens (for live queue stream display)
app.get('/api/tokens', async (req, res) => {
  try {
    const db = await initDB();
    const limit = parseInt(req.query.limit) || 20;
    const doctorName = req.query.doctorName;
    let query = 'SELECT * FROM tokens ORDER BY id DESC LIMIT ?';
    let params = [limit];
    if (doctorName) {
      query = 'SELECT * FROM tokens WHERE doctorName = ? ORDER BY id DESC LIMIT ?';
      params = [doctorName, limit];
    }
    const tokens = await db.all(query, params);
    const parsed = tokens.map(t => ({
      ...t,
      aiFactors: typeof t.aiFactors === 'string' ? JSON.parse(t.aiFactors) : t.aiFactors
    }));
    res.json(parsed);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Admin aggregate stats endpoint
app.get('/api/stats', async (req, res) => {
  try {
    const db = await initDB();
    const total = await db.get('SELECT COUNT(*) as count FROM tokens');
    const completed = await db.get("SELECT COUNT(*) as count FROM tokens WHERE status = 'Checked-in at Kiosk' OR positionInQueue = 0");
    const doctors = await db.all('SELECT * FROM doctors');
    const avgQueueLen = doctors.length > 0 
      ? (doctors.reduce((s, d) => s + d.queueLength, 0) / doctors.length).toFixed(1) 
      : 0;
    const avgConsultTime = doctors.length > 0
      ? (doctors.reduce((s, d) => s + d.avgConsultTimeMinutes, 0) / doctors.length).toFixed(1)
      : 0;

    res.json({
      totalTokensToday: total.count,
      consultationsCompleted: completed.count,
      avgConsultSpeedMins: avgConsultTime,
      aiWaitAccuracy: '96.4%',
      activeDoctors: doctors.filter(d => d.status === 'In Room' || d.queueLength > 0).length,
      avgQueueLength: avgQueueLen,
      doctors: doctors
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Health check endpoint
app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString(), uptime: process.uptime() });
});

server.listen(PORT, () => {
  console.log(`Mediqueue Authenticated Real-time Socket API Server running on port ${PORT}`);
});
