const express = require('express');
const { Pool } = require('pg');
const cors = require('cors');
const bodyParser = require('body-parser');

const app = express();
const PORT = process.env.PORT || 3000;

app.use(cors());
app.use(bodyParser.json());
app.use(express.static('public'));

// PostgreSQL Database connection
const pool = new Pool({
  connectionString: process.env.DATABASE_URL || 'postgresql://localhost:5432/labor_management',
  ssl: process.env.NODE_ENV === 'production' ? { rejectUnauthorized: false } : false
});

// Initialize database tables
async function initializeDatabase() {
  try {
    // Create records table
    await pool.query(`
      CREATE TABLE IF NOT EXISTS records (
        id VARCHAR(50) PRIMARY KEY,
        name VARCHAR(255) NOT NULL,
        date DATE NOT NULL,
        description TEXT,
        baki DECIMAL(10,2) DEFAULT 0,
        jama DECIMAL(10,2) DEFAULT 0,
        total DECIMAL(10,2) DEFAULT 0,
        section VARCHAR(20) DEFAULT 'daily',
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `);
    
    // Create finished_status table
    await pool.query(`
      CREATE TABLE IF NOT EXISTS finished_status (
        name VARCHAR(255) PRIMARY KEY,
        finished BOOLEAN DEFAULT FALSE,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `);
    
    console.log('Database initialized successfully');
  } catch (error) {
    console.error('Database initialization error:', error);
  }
}

// API Routes

// Get all records
app.get('/api/records', async (req, res) => {
  try {
    const { rows } = await pool.query('SELECT * FROM records ORDER BY date DESC');
    res.json(rows);
  } catch (error) {
    console.error('Error fetching records:', error);
    res.status(500).json({ error: 'Failed to fetch records' });
  }
});

// Add new record
app.post('/api/records', async (req, res) => {
  try {
    const { id, name, date, description, baki, jama, total, section } = req.body;
    
    const { rows } = await pool.query(
      'INSERT INTO records (id, name, date, description, baki, jama, total, section) VALUES ($1, $2, $3, $4, $5, $6, $7, $8) RETURNING *',
      [id, name, date, description, baki, jama, total, section || 'daily']
    );
    
    res.json({ success: true, id });
  } catch (error) {
    console.error('Error adding record:', error);
    res.status(500).json({ error: 'Failed to add record' });
  }
});

// Update record
app.put('/api/records/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const { name, date, description, baki, jama, total, section } = req.body;
    
    const { rows } = await pool.query(
      'UPDATE records SET name=$1, date=$2, description=$3, baki=$4, jama=$5, total=$6, section=$7 WHERE id=$8 RETURNING *',
      [name, date, description, baki, jama, total, section || 'daily', id]
    );
    
    res.json({ success: true });
  } catch (error) {
    console.error('Error updating record:', error);
    res.status(500).json({ error: 'Failed to update record' });
  }
});

// Delete record
app.delete('/api/records/:id', async (req, res) => {
  try {
    const { id } = req.params;
    
    const { rows } = await pool.query('DELETE FROM records WHERE id = $1 RETURNING *', [id]);
    
    res.json({ success: true });
  } catch (error) {
    console.error('Error deleting record:', error);
    res.status(500).json({ error: 'Failed to delete record' });
  }
});

// Get finished status
app.get('/api/finished-status', async (req, res) => {
  try {
    const { rows } = await pool.query('SELECT * FROM finished_status');
    const status = {};
    rows.forEach(row => {
      status[row.name] = row.finished;
    });
    res.json(status);
  } catch (error) {
    console.error('Error fetching finished status:', error);
    res.status(500).json({ error: 'Failed to fetch finished status' });
  }
});

// Update finished status
app.post('/api/finished-status', async (req, res) => {
  try {
    const { name, finished } = req.body;
    
    await pool.query(
      `INSERT INTO finished_status (name, finished) 
       VALUES ($1, $2) 
       ON CONFLICT (name) 
       DO UPDATE SET finished = $2, updated_at = CURRENT_TIMESTAMP`,
      [name, finished]
    );
    
    res.json({ success: true });
  } catch (error) {
    console.error('Error updating finished status:', error);
    res.status(500).json({ error: 'Failed to update finished status' });
  }
});

// Get records by worker name
app.get('/api/records/worker/:name', async (req, res) => {
  try {
    const { name } = req.params;
    const { rows } = await pool.query(
      'SELECT * FROM records WHERE name = $1 ORDER BY date ASC',
      [name]
    );
    res.json(rows);
  } catch (error) {
    console.error('Error fetching worker records:', error);
    res.status(500).json({ error: 'Failed to fetch worker records' });
  }
});

// Health check
app.get('/health', (req, res) => {
  res.json({ status: 'OK', timestamp: new Date().toISOString() });
});

app.listen(PORT, async () => {
  console.log(`Server running on port ${PORT}`);
  await initializeDatabase();
});