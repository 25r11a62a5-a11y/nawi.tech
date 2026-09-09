import { Pool } from 'pg';

// In a real application, these values would come from environment variables (.env.local)
const pool = new Pool({
  user: process.env.DB_USER || 'postgres',
  host: process.env.DB_HOST || 'localhost',
  database: process.env.DB_NAME || 'sih26035_nawi',
  password: process.env.DB_PASSWORD || 'password',
  port: process.env.DB_PORT || 5432,
});

export const query = (text, params) => pool.query(text, params);
