import { testConnection } from './server/db';

async function runTest() {
  const result = await testConnection();
  console.log('Database connection test result:', result);
  process.exit(result ? 0 : 1);
}

runTest();