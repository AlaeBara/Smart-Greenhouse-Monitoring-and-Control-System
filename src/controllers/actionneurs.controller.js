import Actionneur from '../models/actionneur.model.js';
import { getPool } from '../config/postgres.js';

export const createActionneur = async (req, res) => {
  const actionneur = await Actionneur.create(req.body);
  // Mirror insert into Postgres (best-effort)
  try {
    const pool = getPool();
    if (pool) {
      await pool.query(
        `INSERT INTO actionneurs (mongo_id, nom, type, etat, date_installation, derniere_activation)
         VALUES ($1, $2, $3, $4, $5, $6)
         ON CONFLICT (mongo_id) DO NOTHING`,
        [
          String(actionneur._id),
          actionneur.nom,
          actionneur.type,
          actionneur.etat || 'OFF',
          actionneur.date_installation || null,
          actionneur.derniere_activation || null
        ]
      );
    }
  } catch (e) {
    console.error('Postgres insert (actionneurs) failed:', e.message);
  }
  res.status(201).json(actionneur);
};

export const listActionneurs = async (_req, res) => {
  const list = await Actionneur.find();
  res.json(list);
};
