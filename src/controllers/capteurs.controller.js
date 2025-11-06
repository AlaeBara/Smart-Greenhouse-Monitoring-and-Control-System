import Capteur from '../models/capteur.model.js';

export const createCapteur = async (req, res) => {
  const capteur = await Capteur.create(req.body);
  res.status(201).json(capteur);
};

export const listCapteurs = async (_req, res) => {
  const list = await Capteur.find();
  res.json(list);
};
