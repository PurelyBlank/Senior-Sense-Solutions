require('dotenv').config();
const express = require('express');
const { Pool } = require('pg');
const cors = require('cors');
const bcrypt = require('bcrypt');
const saltRounds = 10;
const jwt = require('jsonwebtoken');
const multer  = require('multer')
const fs = require('fs');
const path = require('path');
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

// storage defintion to store user uploads of images (in uploads folder of backend directory )
const storage = multer.diskStorage({
  destination: function (req, file, cb){

    const uploadPath = path.join(__dirname, 'uploads');
    if(!fs.existsSync(uploadPath)){
      fs.mkdirSync(uploadPath);
    }


    cb(null, uploadPath);
  },


  filename: function (req, file,cb){
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 159);
    const ext = path.extname(file.originalname);
    cb(null, file.fieldname + '-' + uniqueSuffix + ext);
  }
});

const upload = multer({ storage: storage })

// Test backend connection to PostgreSQL database
pool.connect((err) => {
  if (err) {
    console.error('Database connection error:', err.stack);
  } else {
    console.log('Connected to PostgreSQL database');
  }
});

// Middleware to verify JSON Web Token (JWT)
const authenticateToken = (req, res, next) => {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];

  if (!token) {
    console.error('Authentication error: No token provided');
    return res.status(401).json({ error: 'Access denied. No token provided.' });
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET_KEY);
    req.user = decoded;
    next();
    
  } catch (err) {
    console.error('Authentication error: Invalid token', err.message);
    return res.status(403).json({ error: 'Invalid or expired token.' });
  }
};

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

// Biometric monitor page endpoint to retrieve caretaker user's first name (POST request)
app.post('/api/caretaker-firstname', async (req, res) => {
  try {
    const authHeader = req.headers.authorization;
    if (!authHeader) {
      return res.status(401).json({ error: 'No token provided.' });
    }

    const token = authHeader.split(' ')[1];
    if (!token) {
      return res.status(401).json({ error: 'Malformed token.' });
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET_KEY);
    const email = decoded.email;

    if (!email) {
      console.log('No email in decoded token.');
      
      return res.status(400).json({ error: 'Invalid token: email not found.' });
    }

    const result = await pool.query('SELECT first_name FROM Caretaker WHERE email = $1', [email]);
    const caretaker = result.rows[0];

    if (!caretaker) {
      return res.status(404).json({ error: 'Caretaker user not found.' });
    }

    res.json({ caretakerName: caretaker.first_name });

  } catch (err) {
    console.error('Error:', err);

    if (err.name === 'JsonWebTokenError') {
      return res.status(401).json({ error: 'Invalid token.' });
    }
    if (err.name === 'TokenExpiredError') {
      return res.status(401).json({ error: 'Token expired.' });
    }
    
    res.status(500).json({ error: 'Server error.' });
  }
});

// Patient component endpoint to add new Patient (POST request)
app.post('/api/patients', async (req, res) => {
  try {
    const authHeader = req.headers.authorization;
    if (!authHeader) {
      return res.status(401).json({ error: 'No token provided.' });
    }

    const token = authHeader.split(' ')[1];
    if (!token) {
      return res.status(401).json({ error: 'Malformed token.' });
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET_KEY);
    const caretaker_id = decoded.user_id;

    const {
      wearable_id,
      first_name,
      last_name,
      gender,
      age,
      height,
      weight,
      profile_picture, 
    } = req.body;

    // Validate required input fields
    if (!first_name || !last_name || !wearable_id) {
      return res.status(400).json({ error: 'First name, last name, and wearable ID are required fields.' });
    }

    // Validate age input field
    if (age < 0 || age > 150) {
      return res.status(400).json({ error: 'Age is invalid.' });
    }

    // Validate wearable_id exists
    const wearableCheck = await pool.query('SELECT wearable_id FROM wearable WHERE wearable_id = $1', [wearable_id]);
    if (wearableCheck.rows.length === 0) {
      return res.status(400).json({ error: 'Device not found.' });
    }

    // Validate wearable_id is not already assigned to a patient
    const patientCheck = await pool.query('SELECT wearable_id FROM patients WHERE wearable_id = $1', [wearable_id]);
    if (patientCheck.rows.length > 0) {
      return res.status(400).json({ error: 'Wearable ID is already assigned to a patient.' });
    }

    // Insert new patient in Patient table
    const result = await pool.query(
      `INSERT INTO patients (
        caretaker_id, wearable_id, first_name, last_name, gender, age, height, weight, profile_picture
      ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)
      RETURNING patient_id`,
      [caretaker_id, wearable_id, first_name, last_name, gender, age, height, weight, profile_picture]
    );

    const patient_id = result.rows[0].patient_id;
    res.status(201).json({ patient_id });

  } catch (err) {
    console.error('Add patient error:', err);

    if (err.code === '23505') {
      return res.status(409).json({ error: 'Wearable ID is already assigned to a patient.' });
    }
    if (err.code === '22P02') {
      return res.status(400).json({ error: 'Invalid data format.' });
    }

    res.status(500).json({ error: 'Server error.' });
  }
});

// Patient component endpoint to retrieve Patient rows (GET request)
app.get('/api/patients', async (req, res) => {
  try {
    const authHeader = req.headers.authorization;
    if (!authHeader) {
      return res.status(401).json({ error: 'No token provided.' });
    }

    const token = authHeader.split(' ')[1];
    if (!token) {
      return res.status(401).json({ error: 'Malformed token.' });
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET_KEY);
    const caretaker_id = decoded.user_id;

    // Query for all Patient rows assigned to user's caretaker_id
    const result = await pool.query(
      `SELECT patient_id, wearable_id, first_name, last_name, gender, age, height, weight, profile_picture
       FROM patients WHERE caretaker_id = $1`,
      [caretaker_id]
    );

    // Map each Patient row in response data
    const patients = result.rows.map(patient => ({
      patient_id: patient.patient_id,
      wearable_id: patient.wearable_id,
      first_name: patient.first_name,
      last_name: patient.last_name,
      gender: patient.gender,
      age: patient.age,
      height: patient.height,
      weight: patient.weight,
      profile_picture: patient.profile_picture,
    }));

    res.json({ patients });

  } catch (err) {
    console.error('Get patients error:', err);

    if (err.name === 'JsonWebTokenError') {
      return res.status(401).json({ error: 'Invalid token.' });
    }
    if (err.name === 'TokenExpiredError') {
      return res.status(401).json({ error: 'Token expired.' });
    }

    res.status(500).json({ error: 'Server error.' });
  }
});

// Patient component endpoint to update Patient attributes (Gender, Age, Height, Weight)
app.patch('/api/patients/:id', authenticateToken, async (req, res) => {
  const { id } = req.params;
  const caretaker_id = req.user.user_id;
  const { gender, age, height, weight } = req.body;

  try {
    // Verify Patient exists and belongs to current user
    const patientCheck = await pool.query(
      'SELECT * FROM patients WHERE patient_id = $1 AND caretaker_id = $2',
      [id, caretaker_id]
    );
    if (patientCheck.rows.length === 0) {
      return res.status(404).json({ error: 'Patient not found or not authorized.' });
    }

    // Build dynamic update query
    const fields = [];
    const values = [];
    let index = 1;

    if (gender !== undefined) {
      fields.push(`gender = $${index++}`);
      values.push(gender);
    }
    if (age !== undefined) {
      fields.push(`age = $${index++}`);
      values.push(age);
    }
    if (height !== undefined) {
      fields.push(`height = $${index++}`);
      values.push(height);
    }
    if (weight !== undefined) {
      fields.push(`weight = $${index++}`);
      values.push(weight);
    }

    // Prevent update attempt if no input fields are filled
    if (fields.length === 0) {
      return res.status(400).json({ error: 'No fields provided to update.' });
    }

    // Update gender, age, height, or weight for current Patient
    const query = `UPDATE patients SET ${fields.join(', ')} WHERE patient_id = $${index} AND caretaker_id = $${index + 1} RETURNING *`;
    values.push(id, caretaker_id);
    
    const result = await pool.query(query, values);
    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Patient not found.' });
    }

    res.json({ patient: result.rows[0] });

  } catch (err) {
    console.error('Update Patient error:', err);
    res.status(500).json({ error: 'Failed to update Patient.' });
  }
});

// Patient component endpoint to delete a patient row
app.delete("/api/patients/:id", authenticateToken, async (req, res) => {
  const { id } = req.params;

  try {
    // Retrieve the wearable_id of the patient to be deleted
    const patientResult = await pool.query('SELECT wearable_id FROM patients WHERE patient_id = $1', [id]);
    if (patientResult.rows.length === 0) {
      return res.status(404).json({ error: 'Patient not found.'});
    }
    const { wearable_id } = patientResult.rows[0];

    // Delete all rows from wearable_data table associated with deleted patient's wearable_id
    await pool.query('DELETE FROM wearable_data WHERE wearable_id = $1', [wearable_id]);

    // Delete row from Patients table
    const result = await pool.query("DELETE FROM patients WHERE patient_id = $1", [id]);
    if (result.rowCount === 0) {
      return res.status(404).json({ error: "Patient not found." });
    }

    res.json({ message: "Patient and all associated wearable data deleted successfully." });

  } catch (err) {
    console.error("Error deleting patient:", err);
    
    res.status(500).json({ error: "Internal server error." });
  }
});

// Biometric Monitor page endpoint to retrieve a patient's heart rate (POST request)
app.post('/api/patient-heartrate', async (req, res) => {
  try {
    const authHeader = req.headers.authorization;
    if (!authHeader) {
      return res.status(401).json({ error: 'No token provided.' });
    }

    const token = authHeader.split(' ')[1];
    if (!token) {
      return res.status(401).json({ error: 'Malformed token.' });
    }

    const wearable_id = req.body.wearable_id;
    if (!wearable_id) {
      return res.status(400).json({ error: "wearable_id not here." });
    }

    const result = await pool.query(
      `
        SELECT
          wearable_id,
          timestamp,
          heart_rate
        FROM wearable_data 
        WHERE wearable_id = $1 
        ORDER BY timestamp DESC;
      `,
      [wearable_id]
    );

    const patient_data = result.rows[0];

    if (!patient_data) {
      console.log("patient_data not found for patient with wearable: ", wearable_id);

      return res.status(404).json({ error: 'patient_data not found (heartrate)' });
    }

    res.json({ 
      patientHeartRate: patient_data.heart_rate
    });

  } catch (err) {
    console.error('Error retrieving patient heart rate:', err);

    if (err.name === 'JsonWebTokenError') {
      return res.status(401).json({ error: 'Invalid token.' });
    }
    if (err.name === 'TokenExpiredError') {
      return res.status(401).json({ error: 'Token expired.' });
    }
    
    res.status(500).json({ error: 'Server error.' });
  }
});

// Predictive Analysis page endpoint to retrieve a patient's steps count (POST request)
app.post('/api/patient-activity-chart', async (req, res) => {
  try {
    const authHeader = req.headers.authorization;
    if (!authHeader) {
      return res.status(401).json({ error: 'No token provided.' });
    }

    const token = authHeader.split(' ')[1];
    if (!token) {
      return res.status(401).json({ error: 'Malformed token.' });
    }

    const wearable_id = req.body.wearable_id;
    if (!wearable_id) {
      return res.status(400).json({ error: "wearable_id not here." });
    }

    // Query to calculate average step count for each day of the week
    const result = await pool.query(
      `
        SELECT
          EXTRACT(DOW FROM timestamp) AS day_of_week,
          SUM(num_steps) AS total_steps
        FROM wearable_data
        WHERE wearable_id = $1
          AND timestamp >= (DATE_TRUNC('week', CURRENT_DATE) + INTERVAL '7 days') - INTERVAL '7 days'
          AND timestamp <= (DATE_TRUNC('week', CURRENT_DATE) + INTERVAL '7 days')
        GROUP BY day_of_week
        ORDER BY day_of_week;
      `,
      [wearable_id]
    );
    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'No step data found for the given wearable_id' });
    }

    // Map query results to array of avg. step counts for each weekday
    const stepData = Array(7).fill(null);
    result.rows.forEach((row) => {
      const dayOfWeek = parseInt(row.day_of_week, 10);
      stepData[dayOfWeek] = parseFloat(row.total_steps);
    });

    res.json({ stepData });

  } catch (err) {
    console.error('Error retrieving step data:', err);

    if (err.name === 'JsonWebTokenError') {
      return res.status(401).json({ error: 'Invalid token.' });
    }
    if (err.name === 'TokenExpiredError') {
      return res.status(401).json({ error: 'Token expired.' });
    }
    
    res.status(500).json({ error: 'Server error.' });
  }
});

// Predictive Analysis page endpoint to retrieve a patient's heart rate (POST request)
app.post('/api/patient-heartrate-chart', async (req, res) => {
  try {
    const authHeader = req.headers.authorization;
    if (!authHeader) {
      return res.status(401).json({ error: 'No token provided.' });
    }

    const token = authHeader.split(' ')[1];
    if (!token) {
      return res.status(401).json({ error: 'Malformed token.' });
    }

    const wearable_id = req.body.wearable_id;
    if (!wearable_id) {
      return res.status(400).json({ error: "wearable_id not here." });
    }

    // Query to calculate average heart rate for each day of the week
    const result = await pool.query(
      `
        SELECT
          EXTRACT(DOW FROM timestamp) AS day_of_week,
          AVG(heart_rate) AS avg_heart_rate
        FROM wearable_data
        WHERE wearable_id = $1
          AND timestamp >= (DATE_TRUNC('week', CURRENT_DATE) + INTERVAL '7 days') - INTERVAL '7 days'
          AND timestamp <= (DATE_TRUNC('week', CURRENT_DATE) + INTERVAL '7 days')
        GROUP BY day_of_week
        ORDER BY day_of_week;
      `,
      [wearable_id]
    );
    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'No heart rate data found for the given wearable_id' });
    }

    // Map query results to array of avg. heart rates for each weekday
    const heartRateData = Array(7).fill(null);
    result.rows.forEach((row) => {
      const dayOfWeek = parseInt(row.day_of_week, 10);
      heartRateData[dayOfWeek] = parseFloat(row.avg_heart_rate);
    });

    res.json({ heartRateData });

  } catch (err) {
    console.error('Error retrieving patient heart rate data:', err);

    if (err.name === 'JsonWebTokenError') {
      return res.status(401).json({ error: 'Invalid token.' });
    }
    if (err.name === 'TokenExpiredError') {
      return res.status(401).json({ error: 'Token expired.' });
    }
    
    res.status(500).json({ error: 'Server error.' });
  }
});

// Biometric monitor endpoint to retrieve patient heart rate alert (POST request)
app.post('/api/heart-rate-alert', async (req, res) => {
  try {
    const authHeader = req.headers.authorization;
    if (!authHeader) {
      return res.status(401).json({ error: 'No token provided.' });
    }

    const token = authHeader.split(' ')[1];
    if (!token) {
      return res.status(401).json({ error: 'Malformed token.' });
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET_KEY);
    const user_id = decoded.user_id;
    if (!user_id) {
      console.log("No user_id in decoded token");
      
      return res.status(400).json({ error: 'Invalid token: user_id not found.' });
    }

    const patientsQuery = await pool.query(
      `
        SELECT p.patient_id, p.first_name, p.last_name, p.wearable_id
        FROM patients p
        WHERE p.caretaker_id = $1;
      `,
      [user_id]
    );

    const heartRateNotifications = [];
    for (let patientRow of patientsQuery.rows) {
      const heartRateResult = await pool.query(
        `SELECT heart_rate, timestamp FROM wearable_data
         WHERE wearable_id = $1
         ORDER BY timestamp DESC LIMIT 1`,
        [patientRow.wearable_id]
      );
      if (heartRateResult.rowCount > 0) {
        const { heart_rate, timestamp } = heartRateResult.rows[0];

        heartRateNotifications.push({
          patient_name: `${patientRow.first_name} ${patientRow.last_name}`,
          heart_rate,
          timestamp,
        });
      }
    }

    res.json({ heartRates: heartRateNotifications });

  } catch (err) {
    console.error(err);

    if (err.name === 'JsonWebTokenError') {
      return res.status(401).json({ error: 'Invalid token.' });
    }
    if (err.name === 'TokenExpiredError') {
      return res.status(401).json({ error: 'Token expired.' });
    }

    res.status(500).json({ error: "Internal server error." });
  }
});

// Biometric monitor endpoint to retrieve patient fall alert and location (POST request)
app.post('/api/fall-alert', async (req, res) => {
  try {
    const authHeader = req.headers.authorization;
    if (!authHeader) {
      return res.status(401).json({ error: 'No token provided.' });
    }

    const token = authHeader.split(' ')[1];
    if (!token) {
      return res.status(401).json({ error: 'Malformed token.' });
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET_KEY);
    const user_id = decoded.user_id;
    if (!user_id) {
      console.log("No user_id in decoded token");
      
      return res.status(400).json({ error: 'Invalid token: user_id not found.' });
    }

    const patientsQuery = await pool.query(
      `
        SELECT
          c.user_id AS caretaker_id,
          c.first_name AS caretaker_first_name,
          p.patient_id,
          p.first_name AS patient_first_name,
          p.last_name AS patient_last_name,
          p.wearable_id
        FROM caretaker c
        JOIN patients p ON c.user_id = p.caretaker_id
        WHERE c.user_id = $1;
      `,
      [user_id]
    );

    const notifications = [];
    for (let patientRow of patientsQuery.rows) {
      const wearableId = patientRow.wearable_id;

      const fallData = await pool.query(
        `SELECT timestamp, longitude, latitude FROM wearable_data
         WHERE wearable_id = $1 AND num_falls > 0
         ORDER BY timestamp DESC LIMIT 1`,
        [wearableId]
      );
      if (fallData.rowCount > 0) {
        const { timestamp, longitude, latitude } = fallData.rows[0];

        notifications.push({
          patient_name: `${patientRow.patient_first_name} ${patientRow.patient_last_name}`,
          fall: true,
          timestamp,
          longitude,
          latitude,
        });
      }
    }
    if (notifications.length > 0) {
      return res.json({ falls: notifications });

    } else {
      return res.json({ falls: [], message: "No falls detected for any patient." });
    }

  } catch (err) {
    console.error(err);

    if (err.name === 'JsonWebTokenError') {
      return res.status(401).json({ error: 'Invalid token.' });
    }
    if (err.name === 'TokenExpiredError') {
      return res.status(401).json({ error: 'Token expired.' });
    }

    res.status(500).json({ error: "Internal server error." });
  }
});

// Biometric endpoint step count retrieval (POST request)
app.post('/api/step-count', async (req, res) => {
  try {
    const authHeader = req.headers.authorization;
    if (!authHeader) {
      return res.status(401).json({ error: 'No token provided.' });
    }

    const token = authHeader.split(' ')[1];
    if (!token) {
      return res.status(401).json({ error: 'Malformed token.' });
    }

    // Verify token
    let decoded;
    try {
      decoded = jwt.verify(token, process.env.JWT_SECRET_KEY);
    } catch (err) {
      if (err.name === 'TokenExpiredError') {
        return res.status(401).json({ error: 'Token expired.' });
      } else {
        return res.status(401).json({ error: 'Invalid token.' });
      }
    }

    const wearable_id = req.body.wearable_id;
    if (!wearable_id) {
      return res.status(400).json({ error: "wearable_id missing" });
    }

    const range = req.body.range || 'yearly';

    // Setup SQL parts depending on range
    let interval, groupBy, dateFormat;

    switch (range) {
      case 'daily':
        interval = "1 day";
        groupBy = "date_trunc('hour', timestamp)";
        dateFormat = 'YYYY-MM-DD HH24:00';
        break;

      case 'weekly':
        interval = "7 days";
        groupBy = "date_trunc('day', timestamp)";
        dateFormat = 'YYYY-MM-DD';
        break;

      case 'monthly':
        interval = "1 month";
        groupBy = "date_trunc('day', timestamp)";
        dateFormat = 'YYYY-MM-DD';
        break;

      case '6M':
        interval = "6 months";
        groupBy = "date_trunc('month', timestamp)";
        dateFormat = 'YYYY-MM';
        break;

      case 'yearly':
      case 'Y':
      default:
        interval = "1 year";
        groupBy = "date_trunc('month', timestamp)";
        dateFormat = 'YYYY-MM';
        break;
    }

    // Query to aggregate step counts grouped by the chosen time interval
    const query = `
      SELECT
        to_char(${groupBy}, '${dateFormat}') AS period,
        SUM(num_steps) AS total_steps
      FROM wearable_data
      WHERE wearable_id = $1
        AND timestamp >= NOW() - INTERVAL '${interval}'
      GROUP BY period
      ORDER BY period ASC;
    `;

    const result = await pool.query(query, [wearable_id]);

    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'No step data found for this wearable.' });
    }

    // Return aggregated data
    return res.json({
      steps: result.rows.map(row => ({
        period: row.period,
        total_steps: Number(row.total_steps),
      })),
    });

  } catch (err) {
    console.error('Step count retrieval error:', err);
    return res.status(500).json({ error: 'Server error.' });
  }
});

app.post('/api/patient-fall-chart', async (req, res) => {
  try {
    const authHeader = req.headers.authorization;
    if (!authHeader) {
      return res.status(401).json({ error: 'No token provided.' });
    }

    const token = authHeader.split(' ')[1];
    if (!token) {
      return res.status(401).json({ error: 'Malformed token.' });
    }

    const wearable_id = req.body.wearable_id;
    if (!wearable_id) {
      return res.status(400).json({ error: "wearable_id not here." });
    }

    // Query to calculate the number of falls of each week, over the last 6 weeks
    const result = await pool.query(
      `
      SELECT 
        to_char(date_trunc('week', timestamp), 'YYYY-MM-DD') AS week_start,
        to_char(date_trunc('week', timestamp) + interval '6 days', 'YYYY-MM-DD') AS week_end,
        SUM(num_falls) AS fall_count
      FROM wearable_data
      WHERE wearable_id = $1
        AND timestamp >= date_trunc('week', NOW()) - INTERVAL '5 weeks'
      GROUP BY week_start, week_end
      ORDER BY week_start ASC;
      `,
      [wearable_id]
    );
    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'No data found for the given wearable_id, fall chart' });
    }

    return res.json({
      falls: result.rows.map(row => ({
        week_start: row.week_start,
        week_end: row.week_end,
        fall_count: Number(row.fall_count)||0,
      })),
    });

  } catch (err) {
    console.error('Error retrieving patient fall chart data:', err);

    if (err.name === 'JsonWebTokenError') {
      return res.status(401).json({ error: 'Invalid token.' });
    }
    if (err.name === 'TokenExpiredError') {
      return res.status(401).json({ error: 'Token expired.' });
    }
    
    res.status(500).json({ error: 'Server error.' });
  }
});

app.post('/api/patient-fall-chart-week', async (req, res) => {
  try {
    const authHeader = req.headers.authorization;
    if (!authHeader) {
      return res.status(401).json({ error: 'No token provided.' });
    }

    const token = authHeader.split(' ')[1];
    if (!token) {
      return res.status(401).json({ error: 'Malformed token.' });
    }

    const wearable_id = req.body.wearable_id;
    if (!wearable_id) {
      return res.status(400).json({ error: "wearable_id not here." });
    }

    const week_start = req.body.week_start;
    if (!week_start) {
      return res.status(400).json({ error: "week_start not here." });
    }

    const week_end = req.body.week_end;
    if (!week_end) {
      return res.status(400).json({ error: "week_end not here." });
    }

    // Query to calculate falls for a specific week
    const result = await pool.query(
      `
      SELECT 
        timestamp,
        latitude,
        longitude
      FROM wearable_data
      WHERE wearable_id = $1
        AND timestamp >= $2
        AND timestamp < ($3::date + INTERVAL '1 day')
        AND num_falls = 1
      ORDER BY timestamp ASC;
      `,
      [wearable_id, week_start, week_end]
    );
    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'No data found for the given wearable_id, week_start and week_end' });
    }

    return res.json({ falls: result.rows });

  } catch (err) {
    console.error('Error retrieving patient fall data for a specific week:', err);

    if (err.name === 'JsonWebTokenError') {
      return res.status(401).json({ error: 'Invalid token.' });
    }
    if (err.name === 'TokenExpiredError') {
      return res.status(401).json({ error: 'Token expired.' });
    }
    
    res.status(500).json({ error: 'Server error.' });
  }
});

// Layout endpoint to retrieve caretaker user's first and last names (POST request)
app.post('/api/caretaker-fullname', async (req, res) => {
  try {
    const authHeader = req.headers.authorization;
    if (!authHeader) {
      return res.status(401).json({ error: 'No token provided.' });
    }

    const token = authHeader.split(' ')[1];
    if (!token) {
      return res.status(401).json({ error: 'Malformed token.' });
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET_KEY);
    const email = decoded.email;

    if (!email) {
      console.log('No email in decoded token.');
      
      return res.status(400).json({ error: 'Invalid token: email not found.' });
    }

    const result = await pool.query('SELECT first_name, last_name FROM Caretaker WHERE email = $1', [email]);
    const caretaker = result.rows[0];

    if (!caretaker) {
      return res.status(404).json({ error: 'Caretaker user not found.' });
    }

    res.json({ caretakerFirstName: caretaker.first_name, caretakerLastName: caretaker.last_name });

  } catch (err) {
    console.error('Error:', err);

    if (err.name === 'JsonWebTokenError') {
      return res.status(401).json({ error: 'Invalid token.' });
    }
    if (err.name === 'TokenExpiredError') {
      return res.status(401).json({ error: 'Token expired.' });
    }
    
    res.status(500).json({ error: 'Server error.' });
  }
});

// Battery tracker endpoint (POST request)
app.post('/api/battery-tracker', async (req, res) => {
  try {
    const authHeader = req.headers.authorization;
    if (!authHeader) {
      console.log('No authorization header provided.');

      return res.status(401).json({ error: 'No token provided.' });
    }

    const token = authHeader.split(' ')[1];
    if (!token) {
      console.log('Malformed authorization header.');

      return res.status(401).json({ error: 'Malformed token.' });
    }

    const wearable_id = req.body.wearable_id;
    if (!wearable_id) {
      return res.status(400).json({ error: "wearable_id not here." });
    }

    const result = await pool.query(
      `
        SELECT
          wearable_id,
          timestamp,
          battery_level
        FROM wearable_data 
        WHERE wearable_id = $1 
        ORDER BY timestamp DESC;
      `,
      [wearable_id]
    );

    const wearable_data = result.rows[0];
    if (!wearable_data) {
      return res.status(404).json({ error: 'wearable_data not found.' });
    }

    res.json({ batteryLevel: wearable_data.battery_level });

  } catch (err) {
    console.error('Battery tracker error:', err);

    if (err.name === 'JsonWebTokenError') {
      return res.status(401).json({ error: 'Invalid token.' });
    }
    if (err.name === 'TokenExpiredError') {
      return res.status(401).json({ error: 'Token expired.' });
    }
    
    res.status(500).json({ error: 'Server error.' });
  }
});

// Location endpoint to retrieve a patient's latest location by longitude & latitude (GET request)
app.get('/api/location/:wearable_id', authenticateToken, async (req, res) => {
  const { wearable_id } = req.params;

  try {
    // Query for the latest location data for given wearable_id
    const result = await pool.query (
      `
      SELECT longitude, latitude
      FROM wearable_data
      WHERE wearable_id = $1
      ORDER BY timestamp DESC
      LIMIT 1;
      `,
      [wearable_id]
    );
    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'No location data found for wearable_id.' });
    }

    const wearable_data = result.rows[0];
    if (!wearable_data) {
      return res.status(404).json({ error: 'wearable_data not found.' });
    }

    res.json({ longitude: wearable_data.longitude, latitude: wearable_data.latitude });

  } catch (err) {
    console.error('Location error:', err);

    if (err.name === 'JsonWebTokenError') {
      return res.status(401).json({ error: 'Invalid token.' });
    }
    if (err.name === 'TokenExpiredError') {
      return res.status(401).json({ error: 'Token expired.' });
    }
    
    res.status(500).json({ error: 'Server error.' });
  }
});

// Location endpoint to retrieve a patient's first name and last name by wearable_id (GET request)
app.get('/api/patients/:wearable_id', authenticateToken, async (req, res) => {
  const { wearable_id } = req.params;

  try {
    // Query for patient's first name and last name by wearable_id
    const result = await pool.query (
      `
      SELECT first_name, last_name
      FROM patients
      WHERE wearable_id = $1;
      `,
      [wearable_id]
    );
    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'No patient found for wearable_id.' });
    }

    const patientData = result.rows[0];

    res.json({
      first_name: patientData.first_name,
      last_name: patientData.last_name
    });

  } catch (err) {
    console.error('Error retrieving patient data:', err);

    res.status(500).json({ error: 'Server error.' });
  }
});

// Wearable data endpoint (POST request)
app.post('/api/wearable_data/insert', async (req, res) => {
  try {
    body = req.body;
    
    unparsed = body["timestamp"];
    const parts = unparsed.split('.').map(Number);
    const [year,month,day,dayOfWeek,hour,minute,second] = parts;
    const parsed = new Date(year,month-1,day,hour,minute,second);

    wearable_id = body["wearable_id"];
    timestamp = parsed.toISOString(); // get current timestamp according to database timestamp type
    battery_level = body["battery_level"];
    heart_rate = body["heart_rate"];
    blood_oxygen = body["blood_oxygen"];
    longitude = body["longitude"];
    latitude = body["latitude"];
    num_falls = body["num_falls"];
    num_steps = body["num_steps"];

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

// Endpoint to check if a patient recently fell down for the caretaker to confirm (POST request)
app.post('/api/check-fall', authenticateToken, async (req, res) => {
  const { wearable_id, since } = req.body;

  if (!wearable_id) {
    return res.status(400).json({ error: "Missing wearable_id." });
  }

  try {
    // Query for the latest fall data for given wearable_id
    const result = await pool.query(
      `
      SELECT *
      FROM wearable_data
      WHERE wearable_id = $1
        AND num_falls > 0
        AND timestamp > $2
      ORDER BY timestamp DESC
      LIMIT 1;
      `,
      [wearable_id, since || new Date(Date.now() - 10020000).toISOString()]
    );
    if (result.rows.length === 0) {
      console.log("No fall detected for wearable_id:", wearable_id);

      return res.json({ fallDetected: false });
    }
    const latest = result.rows[0];

    // Query for the associated patient's first name and last name
    const patientResult = await pool.query(
      `
      SELECT first_name, last_name, phone_number FROM patients WHERE wearable_id = $1 LIMIT 1`,
      [wearable_id]
    );
    let first_name = null;
    let last_name = null;
    let phone_number = null;
    if (patientResult.rows.length > 0) {
      first_name = patientResult.rows[0].first_name;
      last_name = patientResult.rows[0].last_name;
      phone_number = patientResult.rows[0].phone_number;
    }

    res.json({
      fallDetected: true,
      fallDate: latest.timestamp,
      fallLocation: {
        latitude: latest.latitude,
        longitude: latest.longitude
      },
      patientFirstName: first_name,
      patientLastName: last_name,
      phoneNumber: phone_number
    });

  } catch (err) {
    console.error("Check fall error:", err);
    res.status(500).json({ error: "Internal server error." });
  }
});

// Endpoint to update num_falls after cancellation of fall alert (PATCH request)
app.patch('/api/cancel-fall', async (req, res) => {
  const { wearable_id, timestamp } = req.body;
  if (!wearable_id || !timestamp) {
    return res.status(400).json({ error: "Missing wearable_id or timestamp." });
  }

  try {
    const result = await pool.query(
      `UPDATE wearable_data SET num_falls = 0 WHERE wearable_id = $1 AND timestamp = $2 RETURNING *;`,
      [wearable_id, timestamp]
    );
    if (result.rowCount === 0) {
      return res.status(404).json({ error: "No matching wearable_data row found." });
    }

    res.json({ message: "Fall data cancelled successfully." });

  } catch (err) {
    console.error("Cancel fall error:", err);
    res.status(500).json({ error: "Internal server error." });
  }
});

app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// Endpoint to create a image url to store later for the patient
app.post('/api/patient/profile', upload.single('avatar'), (req,res) =>{
  try {
    if(!req.file){
      return res.status(400).json({error: 'No file uploaded.'});
    }

    const imageUrl = `${req.protocol}://${req.get('host')}/uploads/${req.file.filename}`;

    res.status(200).json({imageUrl});
  } catch(error){
    console.error('Error handling profile upload:', error);
    res.status(500).json({error: 'Failed to upload profile image. '});
  }
});

// Start server
app.listen(port, () => {
  console.log(`Server running on http://localhost:${port}`);
});