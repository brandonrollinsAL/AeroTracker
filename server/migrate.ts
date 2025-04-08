const { Pool } = require('pg');
const { drizzle } = require('drizzle-orm/node-postgres');
const { migrate } = require('drizzle-orm/node-postgres/migrator');
const schema = require('../shared/schema');

async function pushSchema() {
  const pool = new Pool({
    connectionString: process.env.DATABASE_URL,
  });

  try {
    console.log('Connecting to database...');
    const db = drizzle(pool, { schema });

    console.log('Starting migration...');
    await migrate(db, { migrationsFolder: 'drizzle' });
    console.log('Migration completed successfully!');
  } catch (error) {
    console.error('Migration failed:', error);
  } finally {
    console.log('Closing database connection...');
    await pool.end();
  }
}

pushSchema().catch(console.error);