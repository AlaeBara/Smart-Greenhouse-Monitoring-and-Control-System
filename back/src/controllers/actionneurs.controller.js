import Actionneur from '../models/actionneur.model.js';

export const createActionneur = async (req, res) => {
  const actionneur = await Actionneur.create(req.body);
  res.status(201).json(actionneur);
};

export const listActionneurs = async (_req, res) => {
  const list = await Actionneur.find();
  res.json(list);
};
