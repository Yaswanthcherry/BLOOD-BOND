-- Blood Agent Database Schema

-- Donors Table
CREATE TABLE IF NOT EXISTS donors (
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
);

-- Donations Table
CREATE TABLE IF NOT EXISTS donations (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    donor_id INTEGER NOT NULL,
    donation_date TEXT NOT NULL,
    location TEXT NOT NULL,
    units INTEGER DEFAULT 1,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (donor_id) REFERENCES donors(id)
);

-- Blood Banks Table
CREATE TABLE IF NOT EXISTS blood_banks (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    name TEXT NOT NULL,
    phone TEXT NOT NULL,
    address TEXT NOT NULL,
    latitude REAL,
    longitude REAL,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- Blood Inventory Table
CREATE TABLE IF NOT EXISTS blood_inventory (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    blood_bank_id INTEGER NOT NULL,
    blood_type TEXT NOT NULL,
    status TEXT NOT NULL,
    units_available INTEGER DEFAULT 0,
    last_updated DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (blood_bank_id) REFERENCES blood_banks(id)
);

-- Indexes for better performance
CREATE INDEX IF NOT EXISTS idx_donors_blood_type ON donors(blood_type);
CREATE INDEX IF NOT EXISTS idx_donors_email ON donors(email);
CREATE INDEX IF NOT EXISTS idx_donations_donor_id ON donations(donor_id);
CREATE INDEX IF NOT EXISTS idx_blood_inventory_bank_id ON blood_inventory(blood_bank_id);
