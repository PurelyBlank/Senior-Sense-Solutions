const express = require('express');
const { Pool } = require('pg');
const cors = require('cors');

const app = express();
const port = 5000;

// Middleware
app.use(cors());
app.use(express.json());

// Establish backend connection to PostgreSQL database
const pool = new Pool({
  user: 'postgres',
  host: 'localhost',
  database: 'testdb',
  password: 'postgres',
  port: 5432,
});

// Test backend connection to PostgreSQL database
pool.connect((err) => {
  if (err) {
    console.error('Database connection error:', err.stack);
  } else {
    console.log('Connected to PostgreSQL database');
  }
});

// Create login endpoint (POST request)
app.post('/api/login', async (req, res) => {
  const { email, password } = req.body;

  try {
    if (!email || !password) {
      return res.status(400).json({ error: 'Email and password are required' });
    }

    // Query the database
    const result = await pool.query('SELECT * FROM Caretaker WHERE email = $1', [email]);
    const caretaker_user = result.rows[0];

    if (!caretaker_user) {
      return res.status(401).json({ error: 'Invalid email or password' });
    }

    if (caretaker_user.user_password !== password) {
      return res.status(401).json({ error: 'Invalid email or password' });
    }

    // Return a dummy token (replace with JWT later)
    const token = 'dummy_token';
    res.json({ token });

  } catch (err) {
    console.error('Login error:', err);
    res.status(500).json({ error: 'Server error' });
  }
});

// Start server
app.listen(port, () => {
  console.log(`Server running on http://localhost:${port}`);
});