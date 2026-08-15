import { Pool } from 'pg';
import dotenv from 'dotenv';
import path from 'path';

dotenv.config({ path: path.resolve(process.cwd(), '.env') });

let pool: Pool | null = null;

export async function connectDB() {
  if (!pool) {
    const connectionString = process.env.SUPABASE_DB_URL || process.env.DATABASE_URL;
    if (!connectionString) {
      throw new Error(`SUPABASE_DB_URL is not defined. Env keys: ${Object.keys(process.env).join(', ')}`);
    }

    pool = new Pool({
      connectionString,
      ssl: {
        rejectUnauthorized: false
      }
    });
    
    // Quick test connection
    await pool.query('SELECT 1');
    console.log("Connected to Supabase PostgreSQL Database");
  }
}

export async function query(text: string, params?: any[]) {
  if (!pool) {
    await connectDB();
  }
  return pool!.query(text, params);
}
