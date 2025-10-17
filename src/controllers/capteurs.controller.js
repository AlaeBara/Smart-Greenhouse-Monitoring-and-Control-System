import Capteur from '../models/capteur.model.js';

export const createCapteur = async (req, res) => {
  const capteur = await Capteur.create(req.body);
  res.status(201).json(capteur);
};

export const listCapteurs = async (_req, res) => {
  const list = await Capteur.find();
  res.json(list);
};

export const getCapteur = async (req, res) => {
  const item = await Capteur.findById(req.params.id);
  if (!item) return res.status(404).json({ message: 'Capteur non trouvé' });
  res.json(item);
};

export const updateCapteur = async (req, res) => {
  const updated = await Capteur.findByIdAndUpdate(req.params.id, req.body, { new: true });
  if (!updated) return res.status(404).json({ message: 'Capteur non trouvé' });
  res.json(updated);
};

export const deleteCapteur = async (req, res) => {
  const deleted = await Capteur.findByIdAndDelete(req.params.id);
  if (!deleted) return res.status(404).json({ message: 'Capteur non trouvé' });
  res.json({ message: 'Supprimé' });
};