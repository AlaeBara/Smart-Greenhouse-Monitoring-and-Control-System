import Capteur from '../models/capteur.model.js';
import { getPool } from '../config/postgres.js';

export const createCapteur = async (req, res) => {
  const capteur = await Capteur.create(req.body);
  // Mirror insert into Postgres (best-effort)
  try {
    const pool = getPool();
    if (pool) {
      await pool.query(
        `INSERT INTO capteurs (mongo_id, type, unite, emplacement, date_installation, etat)
         VALUES ($1, $2, $3, $4, $5, $6)
         ON CONFLICT (mongo_id) DO NOTHING`,
        [
          String(capteur._id),
          capteur.type,
          capteur.unite,
          capteur.emplacement || null,
          capteur.date_installation || null,
          !!capteur.etat
        ]
      );
    }
  } catch (e) {
    console.error('Postgres insert (capteurs) failed:', e.message);
  }
  res.status(201).json(capteur);
};

export const listCapteurs = async (_req, res) => {
  const list = await Capteur.find();
  res.json(list);
};
