import { drizzle } from 'drizzle-orm/node-postgres';
import pg from 'pg';
import * as schema from '@shared/schema';

const { Pool } = pg;

// Create a PostgreSQL connection pool
const pool = new Pool({
  connectionString: process.env.DATABASE_URL
});

// Create a Drizzle instance with our schema
export const db = drizzle(pool, { schema });

// Function to test database connection
export async function testConnection() {
  try {
    const client = await pool.connect();
    client.release();
    console.log('Successfully connected to PostgreSQL database!');
    return true;
  } catch (error) {
    console.error('Failed to connect to PostgreSQL database:', error);
    return false;
  }
}