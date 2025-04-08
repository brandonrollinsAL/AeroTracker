const { Pool } = require('pg');
const { drizzle } = require('drizzle-orm/postgres-js');
const { migrate } = require('drizzle-orm/postgres-js/migrator');

// We can't easily import TypeScript schema in a CommonJS file, so let's just push the schema
async function pushSchema() {
  const pool = new Pool({
    connectionString: process.env.DATABASE_URL,
  });

  try {
    console.log('Connecting to database...');
    await pool.query(`
      CREATE TABLE IF NOT EXISTS users (
        id SERIAL PRIMARY KEY,
        username TEXT NOT NULL UNIQUE,
        password TEXT NOT NULL,
        email TEXT NOT NULL UNIQUE,
        preferences JSONB
      );
      
      CREATE TABLE IF NOT EXISTS flights (
        id SERIAL PRIMARY KEY,
        flight_number TEXT NOT NULL,
        airline TEXT NOT NULL,
        aircraft_type TEXT,
        aircraft_registration TEXT,
        departure_airport TEXT NOT NULL,
        arrival_airport TEXT NOT NULL,
        departure_time TIMESTAMP NOT NULL,
        arrival_time TIMESTAMP NOT NULL,
        status TEXT,
        latitude REAL,
        longitude REAL,
        altitude INTEGER,
        heading INTEGER,
        ground_speed INTEGER,
        vertical_speed INTEGER,
        squawk TEXT,
        last_updated TIMESTAMP
      );
      
      CREATE TABLE IF NOT EXISTS alerts (
        id SERIAL PRIMARY KEY,
        user_id INTEGER REFERENCES users(id),
        flight_id INTEGER REFERENCES flights(id),
        type TEXT NOT NULL,
        message TEXT,
        is_read BOOLEAN DEFAULT false,
        created_at TIMESTAMP DEFAULT NOW()
      );
      
      CREATE TABLE IF NOT EXISTS airports (
        id SERIAL PRIMARY KEY,
        code TEXT NOT NULL UNIQUE,
        name TEXT NOT NULL,
        city TEXT NOT NULL,
        country TEXT NOT NULL,
        latitude REAL NOT NULL,
        longitude REAL NOT NULL,
        elevation INTEGER,
        size TEXT,
        type TEXT,
        time_zone TEXT,
        details JSONB
      );
      
      CREATE TABLE IF NOT EXISTS aircraft (
        id SERIAL PRIMARY KEY,
        registration TEXT NOT NULL UNIQUE,
        type TEXT NOT NULL,
        manufacturer TEXT,
        model TEXT,
        variant TEXT,
        airline TEXT,
        manufacturer_serial_number TEXT,
        age REAL,
        category TEXT,
        details JSONB
      );
      
      CREATE TABLE IF NOT EXISTS user_sessions (
        sid TEXT PRIMARY KEY NOT NULL,
        sess JSONB NOT NULL,
        expire TIMESTAMP(6) NOT NULL
      );
      
      CREATE INDEX IF NOT EXISTS IDX_user_sessions_expire ON user_sessions (expire);
    `);
    
    console.log('Database tables created successfully!');
  } catch (error) {
    console.error('Migration failed:', error);
  } finally {
    console.log('Closing database connection...');
    await pool.end();
  }
}

pushSchema().catch(console.error);