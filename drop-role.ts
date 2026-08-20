import { Pool } from 'pg';
import * as dotenv from 'dotenv';

dotenv.config();

async function dropRole() {
  const pool = new Pool({
    connectionString: process.env.DATABASE_URL,
  });

  try {
    await pool.query('ALTER TABLE users DROP COLUMN IF EXISTS role;');
    console.log('Successfully dropped role column.');
  } catch (error) {
    console.error('Error dropping role column:', error);
  } finally {
    await pool.end();
  }
}

dropRole();
