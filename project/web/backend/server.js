require('dotenv').config();
const express = require('express');
const { Pool } = require('pg');
const cors = require('cors');
const bcrypt = require('bcrypt');
const saltRounds = 10;
const jwt = require('jsonwebtoken');

const app = express();
const port = 5000;

// Middleware
app.use(cors());
app.use(express.json());

// Establish backend connection to PostgreSQL database
const pool = new Pool({
  user: process.env.DB_USER,
  host: process.env.DB_HOST,
  database: process.env.DB_NAME,
  password: process.env.DB_PASSWORD,
  port: process.env.DB_PORT,
});

// Test backend connection to PostgreSQL database
pool.connect((err) => {
  if (err) {
    console.error('Database connection error:', err.stack);
  } else {
    console.log('Connected to PostgreSQL database');
  }
});

// Login endpoint (POST request)
app.post('/api/login', async (req, res) => {
  const { email, password } = req.body;

  try {
    if (!email || !password) {
      return res.status(400).json({ error: 'Email and password are required.' });
    }

    // Query the database
    const result = await pool.query('SELECT * FROM Caretaker WHERE email = $1', [email]);
    const caretaker_user = result.rows[0];

    if (!caretaker_user || !(await bcrypt.compare(password, caretaker_user.user_password))) {
      return res.status(401).json({ error: 'Invalid email or password.' });
    }

    // Create a new JSON Web Token tied to current user credentials
    // Expiration is set to '1y' (1 year) for uptime; must implement refresh tokens later for proper security
    const token = jwt.sign({ user_id: caretaker_user.user_id, email: caretaker_user.email }, process.env.JWT_SECRET_KEY, { expiresIn: '1y' });
    res.json({ token });

  } catch (err) {
    console.error('Login error:', err);
    res.status(500).json({ error: 'Server error.' });
  }
});

// Register endpoint (POST request)
app.post('/api/register', async (req, res) => {
  const { firstName, lastName, email, password } = req.body;

  try {
    if (!firstName || !lastName || !email || !password) {
      return res.status(400).json({ error: 'All fields are required.' });
    }

    // Check if email is already registered by another caretaker user
    const emailCheck = await pool.query('SELECT * FROM Caretaker WHERE email=$1', [email]);
    if (emailCheck.rows.length > 0) {
      return res.status(409).json({ error: 'Email already registered.' });
    }

    // Use bcrypt to hash password
    const hashedPassword = await bcrypt.hash(password, saltRounds);
    // Insert new caretaker user into database
    await pool.query(
      'INSERT INTO Caretaker (first_name, last_name, email, user_password, created_at) VALUES ($1, $2, $3, $4, NOW())',
      [firstName, lastName, email, hashedPassword]
    );

    res.status(201).json({ message: 'User registered successfully' });
  } catch (err) {
    console.error('Register error', err);
    if (err.code === '23505') {
      return res.status(409).json({ error: 'Email already registered.' });
    }

    res.status(500).json({ error: 'Server error.' });
  }
});

/*
* Register endpoint for inserting wearable_data
* Format of request body data:
* {
*  "wearable_id"   : <serial>,
*  "timestamp"     : <timestamp with time zone>, // this will be NULL b/c we will have request handle inserting the time into db
*  "battery_level" : <double precision>,
*  "heart_rate"    : <double precision>,
*  "blood_oxygen"  : <double precision>,
*  "longitude"     : <double precision>,
*  "latitude"      : <double precision>,
*  "num_falls"     : <integer>,
*  "num_steps"     : <integer>
* }
*/
app.post('/api/wearable_data/insert', async (req, res) => {
  try {
    body = req.body;

    wearable_id     = body["wearable_id"];
    timestamp       = new Date().toISOString();                   // need to get current timestamp according to database timestamp type
    battery_level   = body["battery_level"];
    heart_rate      = body["heart_rate"];
    blood_oxygen    = body["blood_oxygen"];
    longitude       = body["longitude"];
    latitude        = body["latitude"];
    num_falls       = body["num_falls"];
    num_steps       = body["num_steps"];

    await pool.query(
      `
      INSERT INTO wearable_data (
        wearable_id,
        timestamp,
        battery_level,
        heart_rate,
        blood_oxygen,
        longitude,
        latitude,
        num_falls,
        num_steps
      ) VALUES (
        $1, $2, $3, $4, $5, $6, $7, $8, $9
      )
      `,
      [
        wearable_id,
        timestamp,
        battery_level,
        heart_rate,
        blood_oxygen,
        longitude,
        latitude,
        num_falls,
        num_steps
      ]
    );

    res.status(200).send('Data received');
  } catch (err) {
    console.error("Unable to Insert Wearable Data Error", err);
    res.status(400).send("Unable to Insert Wearable Data Error");
  }
});


app.post('/api/biometric-monitor', async (req, res) => {
  try {
    const authHeader = req.headers.authorization;
    if (!authHeader) return res.status(401).json({ error: 'No token provided' });

    const token = authHeader.split(' ')[1];
    const decoded = jwt.verify(token, process.env.JWT_SECRET_KEY);
    const email = decoded.email;
    
    if (!email) return res.status(400).json({ error: 'No email provided' });

    // Get user's first name from the database
    const result = await pool.query('SELECT first_name FROM Caretaker WHERE email = $1', [email]);
    const firstName = result.rows[0]?.first_name;
    
    if (!firstName) return res.status(404).json({ error: 'User not found' });

    res.json({ firstName });
  } catch (err) {
    console.error('Name display err', err);
    res.status(500).json({ error: 'Server error' });
  }
});


// Start server
app.listen(port, () => {
  console.log(`Server running on http://localhost:${port}`);
});