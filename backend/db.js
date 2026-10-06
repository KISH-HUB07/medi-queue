const sqlite3 = require('sqlite3').verbose();
const { open } = require('sqlite');
const path = require('path');
const bcrypt = require('bcryptjs');

let dbPromise;

async function initDB() {
  if (!dbPromise) {
    dbPromise = open({
      filename: path.join(__dirname, 'mediqueue.db'),
      driver: sqlite3.Database
    });
  }
  const db = await dbPromise;

  // Create tables if they don't exist
  await db.exec(`
    CREATE TABLE IF NOT EXISTS users (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      name TEXT NOT NULL,
      email TEXT UNIQUE NOT NULL,
      password TEXT NOT NULL,
      role TEXT NOT NULL,
      doctorId TEXT
    );

    CREATE TABLE IF NOT EXISTS branches (
      id TEXT PRIMARY KEY,
      name TEXT NOT NULL,
      address TEXT NOT NULL,
      distance TEXT NOT NULL
    );

    CREATE TABLE IF NOT EXISTS departments (
      id TEXT PRIMARY KEY,
      name TEXT NOT NULL,
      icon TEXT NOT NULL,
      color TEXT NOT NULL,
      activeDoctors INTEGER DEFAULT 0,
      avgWait INTEGER DEFAULT 0
    );

    CREATE TABLE IF NOT EXISTS doctors (
      id TEXT PRIMARY KEY,
      name TEXT NOT NULL,
      specialty TEXT NOT NULL,
      deptId TEXT NOT NULL,
      room TEXT NOT NULL,
      rating REAL DEFAULT 5.0,
      experience TEXT NOT NULL,
      status TEXT DEFAULT 'In Room',
      currentToken TEXT NOT NULL,
      queueLength INTEGER DEFAULT 0,
      avgConsultTimeMinutes INTEGER DEFAULT 5
    );

    CREATE TABLE IF NOT EXISTS tokens (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      tokenNumber TEXT NOT NULL,
      patientName TEXT NOT NULL,
      doctorName TEXT NOT NULL,
      specialty TEXT NOT NULL,
      room TEXT NOT NULL,
      department TEXT NOT NULL,
      bookingTime TEXT NOT NULL,
      currentlyServing TEXT NOT NULL,
      positionInQueue INTEGER DEFAULT 0,
      estimatedWaitMinutes INTEGER DEFAULT 0,
      aiConfidenceScore TEXT,
      aiFactors TEXT,
      status TEXT DEFAULT 'Waiting',
      qrCodeUrl TEXT
    );
  `);

  // Seed initial users if empty
  const userCount = await db.get('SELECT COUNT(*) as count FROM users');
  if (userCount.count === 0) {
    const hashedPatient = bcrypt.hashSync('password123', 10);
    const hashedDoctor = bcrypt.hashSync('password123', 10);
    const hashedAdmin = bcrypt.hashSync('admin123', 10);

    await db.run(`INSERT INTO users (name, email, password, role, doctorId) VALUES
      ('Alex Morgan', 'alex@mediqueue.com', ?, 'patient', NULL),
      ('Dr. Rajesh Kumar', 'rajesh@mediqueue.com', ?, 'doctor', 'doc-1'),
      ('Hospital Administrator', 'admin@mediqueue.com', ?, 'admin', NULL)
    `, [hashedPatient, hashedDoctor, hashedAdmin]);
  }

  // Seed initial branches if empty
  const branchCount = await db.get('SELECT COUNT(*) as count FROM branches');
  if (branchCount.count === 0) {
    await db.run(`INSERT INTO branches (id, name, address, distance) VALUES
      ('h1', 'Apollo City Hospital - Main Campus', 'Greams Road, Chennai', '1.2 km'),
      ('h2', 'Fortis Multi-Speciality Clinic', 'Anna Nagar, Chennai', '3.4 km'),
      ('h3', 'CIT Health Center & Research', 'Kundrathur, Chennai', '0.8 km')
    `);
  }

  // Seed initial departments if empty
  const deptCount = await db.get('SELECT COUNT(*) as count FROM departments');
  if (deptCount.count === 0) {
    await db.run(`INSERT INTO departments (id, name, icon, color, activeDoctors, avgWait) VALUES
      ('cardio', 'Cardiology', 'Heart', 'from-rose-500 to-red-600', 4, 18),
      ('peds', 'Pediatrics', 'Baby', 'from-amber-500 to-orange-600', 3, 12),
      ('ortho', 'Orthopedics', 'Activity', 'from-emerald-500 to-teal-600', 5, 25),
      ('general', 'General Medicine', 'Stethoscope', 'from-teal-500 to-cyan-600', 6, 10),
      ('neuro', 'Neurology', 'Brain', 'from-purple-500 to-indigo-600', 2, 30),
      ('derma', 'Dermatology', 'Sparkles', 'from-pink-500 to-rose-500', 3, 15)
    `);
  }

  // Seed initial doctors if empty
  const docCount = await db.get('SELECT COUNT(*) as count FROM doctors');
  if (docCount.count === 0) {
    await db.run(`INSERT INTO doctors (id, name, specialty, deptId, room, rating, experience, status, currentToken, queueLength, avgConsultTimeMinutes) VALUES
      ('doc-1', 'Dr. Rajesh Kumar', 'General Medicine', 'general', 'Room 102 - Block A', 4.9, '14 yrs', 'In Room', 'A-108', 4, 7),
      ('doc-2', 'Dr. Ananya Sundaram', 'Cardiology', 'cardio', 'Room 304 - Cardio Wing', 4.95, '18 yrs', 'In Consultation', 'C-205', 6, 12),
      ('doc-3', 'Dr. Vikramaditya Roy', 'Orthopedics', 'ortho', 'Room 201 - Trauma Care', 4.8, '11 yrs', 'In Room', 'O-412', 2, 10),
      ('doc-4', 'Dr. Priya Sharma', 'Pediatrics', 'peds', 'Room 105 - Child Wellness', 4.9, '9 yrs', 'In Consultation', 'P-088', 5, 8)
    `);
  }

  // Seed initial token if empty
  const tokenCount = await db.get('SELECT COUNT(*) as count FROM tokens');
  if (tokenCount.count === 0) {
    const aiFactorsJSON = JSON.stringify(['Peak Morning Flow', 'Avg 7 min/patient', '0 Emergency overrides']);
    await db.run(`INSERT INTO tokens (tokenNumber, patientName, doctorName, specialty, room, department, bookingTime, currentlyServing, positionInQueue, estimatedWaitMinutes, aiConfidenceScore, aiFactors, status, qrCodeUrl) VALUES
      ('A-112', 'Alex Morgan', 'Dr. Rajesh Kumar', 'General Medicine', 'Room 102 - Block A', 'General Medicine', '10:15 AM', 'A-108', 4, 14, '94% Accurate', ?, 'Waiting', 'https://api.qrserver.com/v1/create-qr-code/?size=180x180&data=MEDIQUEUE-A112-ALEX')
    `, [aiFactorsJSON]);
  }

  return db;
}

module.exports = { initDB };
