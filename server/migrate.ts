import { drizzle } from 'drizzle-orm/node-postgres';
import pg from 'pg';
import * as schema from '@shared/schema';
import { exec } from 'child_process';
import { promisify } from 'util';

const execPromise = promisify(exec);
const { Pool } = pg;

// Create a PostgreSQL connection pool
const pool = new Pool({
  connectionString: process.env.DATABASE_URL
});

// Create a Drizzle instance with our schema
const db = drizzle(pool, { schema });

// Push the schema to the database
async function pushSchema() {
  console.log('Pushing schema to database...');
  try {
    // Test the database connection first
    const client = await pool.connect();
    client.release();
    console.log('Database connection successful!');
    
    // Use drizzle-kit push to create tables
    const { stdout, stderr } = await execPromise('npx drizzle-kit push');
    
    if (stderr) {
      console.error('drizzle-kit stderr:', stderr);
    }
    
    if (stdout) {
      console.log('drizzle-kit output:', stdout);
    }
    
    console.log('Schema pushed successfully!');
  } catch (error) {
    console.error('Error pushing schema:', error);
  } finally {
    await pool.end();
  }
}

// Run the migration
pushSchema();