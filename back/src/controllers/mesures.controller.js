import Mesure from '../models/mesure.model.js';
import Capteur from '../models/capteur.model.js';
import Actionneur from '../models/actionneur.model.js';
import HistoriqueAction from '../models/historiqueAction.model.js';
import { getPool } from '../config/postgres.js';

export const createMesure = async (req, res) => {
  const mesure = await Mesure.create(req.body);
  // Mirror insert into Postgres (best-effort)
  try {
    const pool = getPool();
    if (pool) {
      await pool.query(
        `INSERT INTO mesures (mongo_id, capteur_mongo_id, type, valeur, timestamp)
         VALUES ($1, $2, $3, $4, $5)
         ON CONFLICT (mongo_id) DO NOTHING`,
        [
          String(mesure._id),
          String(mesure.capteur_id),
          mesure.type,
          Number(mesure.valeur),
          mesure.timestamp || new Date()
        ]
      );
    }
  } catch (e) {
    console.error('Postgres insert (mesures) failed:', e.message);
  }
  res.status(201).json(mesure);
};

export const listMesures = async (_req, res) => {
  const list = await Mesure.find();
  res.json(list);
};


export const listMesuresByCapteur = async (req, res) => {
  const list = await Mesure.find({ capteur_id: req.params.capteurId }).sort({ timestamp: -1 });
  res.json(list);
};

export const getLastMesure = async (_req, res) => {
  const last = await Mesure.findOne().sort({ timestamp: -1 });
  if (!last) return res.status(404).json({ message: 'Aucune mesure trouvée' });
  res.json(last);
};

export const getLastMesuresPerCapteur = async (_req, res) => {
  const agg = await Mesure.aggregate([
    { $sort: { timestamp: -1 } },
    { $group: { _id: '$capteur_id', lastMesure: { $first: '$$ROOT' } } },
    { $lookup: { from: 'capteurs', localField: '_id', foreignField: '_id', as: 'capteur' } },
    { $unwind: { path: '$capteur', preserveNullAndEmptyArrays: true } },
    { $project: { _id: 0, capteur_id: '$_id', capteur: { type: '$capteur.type', unite: '$capteur.unite', emplacement: '$capteur.emplacement' }, lastMesure: 1 } }
  ]);
  res.json(agg);
};

export const getLastMesuresAllCapteurs = async (_req, res) => {
  const agg = await Capteur.aggregate([
    { $lookup: {
      from: 'mesures',
      let: { cid: '$_id' },
      pipeline: [
        { $match: { $expr: { $eq: ['$capteur_id', '$$cid'] } } },
        { $sort: { timestamp: -1 } },
        { $limit: 1 }
      ],
      as: 'lastMesure'
    } },
    { $unwind: { path: '$lastMesure', preserveNullAndEmptyArrays: true } },
    { $project: { _id: 0, capteur_id: '$_id', type: 1, unite: 1, emplacement: 1, lastMesure: 1 } }
  ]);
  res.json(agg);
};

export const getLastCapteursAndActionneurs = async (_req, res) => {
  const capteurs = await Capteur.aggregate([
    { $lookup: {
      from: 'mesures',
      let: { cid: '$_id' },
      pipeline: [
        { $match: { $expr: { $eq: ['$capteur_id', '$$cid'] } } },
        { $sort: { timestamp: -1 } },
        { $limit: 1 }
      ],
      as: 'lastMesure'
    } },
    { $unwind: { path: '$lastMesure', preserveNullAndEmptyArrays: true } },
    { $project: { _id: 0, capteur_id: '$_id', type: 1, unite: 1, emplacement: 1, lastMesure: 1 } }
  ]);

  const actionneurs = await Actionneur.aggregate([
    { $lookup: {
      from: 'historique_actions',
      let: { aid: '$_id' },
      pipeline: [
        { $match: { $expr: { $eq: ['$actionneur_id', '$$aid'] } } },
        { $sort: { timestamp: -1 } },
        { $limit: 1 }
      ],
      as: 'lastAction'
    } },
    { $unwind: { path: '$lastAction', preserveNullAndEmptyArrays: true } },
    { $project: { _id: 0, actionneur_id: '$_id', nom: 1, type: 1, etat: 1, derniere_activation: 1, lastAction: 1 } }
  ]);

  res.json({ capteurs, actionneurs });
};