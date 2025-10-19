import Actionneur from '../models/actionneur.model.js';

export const createActionneur = async (req, res) => {
  const actionneur = await Actionneur.create(req.body);
  res.status(201).json(actionneur);
};

export const listActionneurs = async (_req, res) => {
  const list = await Actionneur.find();
  res.json(list);
};

export const getActionneur = async (req, res) => {
  const item = await Actionneur.findById(req.params.id);
  if (!item) return res.status(404).json({ message: 'Actionneur non trouvé' });
  res.json(item);
};

export const updateActionneur = async (req, res) => {
  const updated = await Actionneur.findByIdAndUpdate(req.params.id, req.body, { new: true });
  if (!updated) return res.status(404).json({ message: 'Actionneur non trouvé' });
  res.json(updated);
};

export const deleteActionneur = async (req, res) => {
  const deleted = await Actionneur.findByIdAndDelete(req.params.id);
  if (!deleted) return res.status(404).json({ message: 'Actionneur non trouvé' });
  res.json({ message: 'Supprimé' });
};