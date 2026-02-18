const express = require('express');
const sqlite3 = require('sqlite3').verbose();
const cors = require('cors');
const path = require('path');

const app = express();
const PORT = 3000;

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.static('.'));

// Initialize SQLite database
const db = new sqlite3.Database('./blood_donors.db', (err) => {
    if (err) {
        console.error('Error opening database:', err);
    } else {
        console.log('Connected to SQLite database');
        initializeDatabase();
    }
});

// Create tables
function initializeDatabase() {
    db.run(`CREATE TABLE IF NOT EXISTS donors (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        name TEXT NOT NULL,
        blood_type TEXT NOT NULL,
        phone TEXT NOT NULL,
        email TEXT UNIQUE NOT NULL,
        address TEXT NOT NULL,
        age INTEGER NOT NULL,
        weight INTEGER NOT NULL,
        last_donation_date TEXT,
        registration_date TEXT NOT NULL,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP
    )`);

    db.run(`CREATE TABLE IF NOT EXISTS donations (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        donor_id INTEGER NOT NULL,
        donation_date TEXT NOT NULL,
        location TEXT NOT NULL,
        units INTEGER DEFAULT 1,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (donor_id) REFERENCES donors(id)
    )`);

    db.run(`CREATE TABLE IF NOT EXISTS blood_banks (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        name TEXT NOT NULL,
        phone TEXT NOT NULL,
        address TEXT NOT NULL,
        latitude REAL,
        longitude REAL,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP
    )`);

    db.run(`CREATE TABLE IF NOT EXISTS blood_inventory (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        blood_bank_id INTEGER NOT NULL,
        blood_type TEXT NOT NULL,
        status TEXT NOT NULL,
        units_available INTEGER DEFAULT 0,
        last_updated DATETIME DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (blood_bank_id) REFERENCES blood_banks(id)
    )`);

    console.log('Database tables initialized');
}

// API Routes

// Register new donor
app.post('/api/donors', (req, res) => {
    const { name, bloodType, phone, email, address, age, weight, lastDonationDate } = req.body;
    
    const sql = `INSERT INTO donors (name, blood_type, phone, email, address, age, weight, last_donation_date, registration_date)
                 VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`;
    
    const registrationDate = new Date().toISOString();
    
    db.run(sql, [name, bloodType, phone, email, address, age, weight, lastDonationDate, registrationDate], function(err) {
        if (err) {
            return res.status(400).json({ error: err.message });
        }
        res.json({ id: this.lastID, message: 'Donor registered successfully' });
    });
});

// Get donor by email
app.get('/api/donors/email/:email', (req, res) => {
    const sql = `SELECT * FROM donors WHERE email = ?`;
    
    db.get(sql, [req.params.email], (err, row) => {
        if (err) {
            return res.status(400).json({ error: err.message });
        }
        res.json(row || null);
    });
});

// Update donor
app.put('/api/donors/:id', (req, res) => {
    const { name, bloodType, phone, email, address, age, weight, lastDonationDate } = req.body;
    
    const sql = `UPDATE donors 
                 SET name = ?, blood_type = ?, phone = ?, email = ?, address = ?, age = ?, weight = ?, last_donation_date = ?
                 WHERE id = ?`;
    
    db.run(sql, [name, bloodType, phone, email, address, age, weight, lastDonationDate, req.params.id], function(err) {
        if (err) {
            return res.status(400).json({ error: err.message });
        }
        res.json({ message: 'Donor updated successfully', changes: this.changes });
    });
});

// Get eligible donors by blood type
app.get('/api/donors/search/:bloodType', (req, res) => {
    const bloodType = req.params.bloodType;
    
    // Blood type compatibility map
    const compatibilityMap = {
        "O-": ["O-"],
        "O+": ["O-", "O+"],
        "A-": ["O-", "A-"],
        "A+": ["O-", "O+", "A-", "A+"],
        "B-": ["O-", "B-"],
        "B+": ["O-", "O+", "B-", "B+"],
        "AB-": ["O-", "A-", "B-", "AB-"],
        "AB+": ["O-", "O+", "A-", "A+", "B-", "B+", "AB-", "AB+"]
    };
    
    const compatibleTypes = compatibilityMap[bloodType] || [];
    const placeholders = compatibleTypes.map(() => '?').join(',');
    
    const sql = `SELECT * FROM donors 
                 WHERE blood_type IN (${placeholders})
                 AND (last_donation_date IS NULL OR 
                      julianday('now') - julianday(last_donation_date) >= 30)`;
    
    db.all(sql, compatibleTypes, (err, rows) => {
        if (err) {
            return res.status(400).json({ error: err.message });
        }
        res.json(rows);
    });
});

// Add donation record
app.post('/api/donations', (req, res) => {
    const { donorId, donationDate, location, units } = req.body;
    
    const sql = `INSERT INTO donations (donor_id, donation_date, location, units)
                 VALUES (?, ?, ?, ?)`;
    
    db.run(sql, [donorId, donationDate, location, units], function(err) {
        if (err) {
            return res.status(400).json({ error: err.message });
        }
        
        // Update donor's last donation date
        const updateSql = `UPDATE donors SET last_donation_date = ? WHERE id = ?`;
        db.run(updateSql, [donationDate, donorId]);
        
        res.json({ id: this.lastID, message: 'Donation recorded successfully' });
    });
});

// Get donor's donation history
app.get('/api/donations/donor/:donorId', (req, res) => {
    const sql = `SELECT * FROM donations WHERE donor_id = ? ORDER BY donation_date DESC`;
    
    db.all(sql, [req.params.donorId], (err, rows) => {
        if (err) {
            return res.status(400).json({ error: err.message });
        }
        res.json(rows);
    });
});

// Get all blood banks
app.get('/api/blood-banks', (req, res) => {
    const sql = `SELECT bb.*, 
                 GROUP_CONCAT(bi.blood_type || ':' || bi.status || ':' || bi.units_available) as inventory
                 FROM blood_banks bb
                 LEFT JOIN blood_inventory bi ON bb.id = bi.blood_bank_id
                 GROUP BY bb.id`;
    
    db.all(sql, [], (err, rows) => {
        if (err) {
            return res.status(400).json({ error: err.message });
        }
        res.json(rows);
    });
});

// Add blood bank
app.post('/api/blood-banks', (req, res) => {
    const { name, phone, address, latitude, longitude } = req.body;
    
    const sql = `INSERT INTO blood_banks (name, phone, address, latitude, longitude)
                 VALUES (?, ?, ?, ?, ?)`;
    
    db.run(sql, [name, phone, address, latitude, longitude], function(err) {
        if (err) {
            return res.status(400).json({ error: err.message });
        }
        res.json({ id: this.lastID, message: 'Blood bank added successfully' });
    });
});

// Update blood inventory
app.post('/api/blood-inventory', (req, res) => {
    const { bloodBankId, bloodType, status, unitsAvailable } = req.body;
    
    const sql = `INSERT OR REPLACE INTO blood_inventory (blood_bank_id, blood_type, status, units_available, last_updated)
                 VALUES (?, ?, ?, ?, CURRENT_TIMESTAMP)`;
    
    db.run(sql, [bloodBankId, bloodType, status, unitsAvailable], function(err) {
        if (err) {
            return res.status(400).json({ error: err.message });
        }
        res.json({ message: 'Inventory updated successfully' });
    });
});

// Start server
app.listen(PORT, () => {
    console.log(`Blood Agent server running on http://localhost:${PORT}`);
});

// Graceful shutdown
process.on('SIGINT', () => {
    db.close((err) => {
        if (err) {
            console.error(err.message);
        }
        console.log('Database connection closed');
        process.exit(0);
    });
});
