import { Pool } from 'pg';
import dotenv from 'dotenv';

dotenv.config();

export const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: false,
});

export async function initDb(): Promise<void> {
  await pool.query(`
    CREATE TABLE IF NOT EXISTS transactions (
      id          SERIAL PRIMARY KEY,
      date        DATE           NOT NULL,
      description VARCHAR(255)   NOT NULL,
      amount      NUMERIC(10,2)  NOT NULL,
      category    VARCHAR(50)    NOT NULL
    );
  `);

  await pool.query(`
    CREATE TABLE IF NOT EXISTS budgets (
      id            SERIAL PRIMARY KEY,
      category      VARCHAR(50)    NOT NULL UNIQUE,
      monthly_limit NUMERIC(10,2)  NOT NULL
    );
  `);
}
