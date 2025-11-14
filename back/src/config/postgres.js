import { Pool } from 'pg';
import dotenv from 'dotenv';
import path from 'path';
dotenv.config({ path: path.resolve(process.cwd(), '.env') });

// Use Neon/Postgres URL from env; support multiple var names
const connectionString = process.env.NEON_DATABASE_URL;

let pool;

export const connectPostgres = async () => {
  if (!connectionString) {
    console.warn('Postgres connection string not set (NEON_DATABASE_URL/POSTGRES_URL/DATABASE_URL)');
    return null;
  }
  if (pool) return pool;
  pool = new Pool({ connectionString, ssl: { rejectUnauthorized: false } });
  // Test connection
  await pool.query('SELECT 1');
  console.log('Connected to Postgres (Neon)');
  return pool;
};

export const ensureTables = async () => {
  if (!pool) return;
  // Create tables mirroring Mongo models (simplified, using mongo_id for linkage)
  const queries = [
    `CREATE TABLE IF NOT EXISTS utilisateurs (
      id SERIAL PRIMARY KEY,
      mongo_id TEXT UNIQUE,
      nom TEXT NOT NULL,
      email TEXT UNIQUE NOT NULL,
      mot_de_passe TEXT NOT NULL,
      date_creation TIMESTAMP DEFAULT NOW()
    );`,
    `CREATE TABLE IF NOT EXISTS capteurs (
      id SERIAL PRIMARY KEY,
      mongo_id TEXT UNIQUE,
      type TEXT NOT NULL,
      unite TEXT NOT NULL,
      emplacement TEXT,
      date_installation TIMESTAMP,
      etat BOOLEAN DEFAULT TRUE
    );`,
    `CREATE TABLE IF NOT EXISTS actionneurs (
      id SERIAL PRIMARY KEY,
      mongo_id TEXT UNIQUE,
      nom TEXT NOT NULL,
      type TEXT NOT NULL,
      etat TEXT CHECK (etat IN ('ON','OFF')) DEFAULT 'OFF',
      date_installation TIMESTAMP,
      derniere_activation TIMESTAMP
    );`,
    `CREATE TABLE IF NOT EXISTS mesures (
      id SERIAL PRIMARY KEY,
      mongo_id TEXT UNIQUE,
      capteur_mongo_id TEXT NOT NULL,
      type TEXT NOT NULL,
      valeur DOUBLE PRECISION NOT NULL,
      timestamp TIMESTAMP DEFAULT NOW()
    );`,
    `CREATE TABLE IF NOT EXISTS historique_actions (
      id SERIAL PRIMARY KEY,
      mongo_id TEXT UNIQUE,
      actionneur_mongo_id TEXT NOT NULL,
      type_action TEXT NOT NULL,
      etat TEXT CHECK (etat IN ('ON','OFF')) NOT NULL,
      timestamp TIMESTAMP DEFAULT NOW()
    );`
  ];

  for (const q of queries) {
    await pool.query(q);
  }
  console.log('Ensured Postgres tables exist');
};

export const getPool = () => pool;