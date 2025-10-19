import HistoriqueAction from '../models/historiqueAction.model.js';

export const createHistoriqueAction = async (req, res) => {
  const act = await HistoriqueAction.create(req.body);
  res.status(201).json(act);
};

export const listHistoriqueActions = async (_req, res) => {
  const list = await HistoriqueAction.find()
    .populate({ path: 'actionneur_id', model: 'Actionneur' });
  res.json(list);
};

export const listHistoriqueByActionneur = async (req, res) => {
  const list = await HistoriqueAction.find({ actionneur_id: req.params.actionneurId }).sort({ timestamp: -1 });
  res.json(list);
};

export const getLastActionPerActionneur = async (_req, res) => {
  const agg = await HistoriqueAction.aggregate([
    { $sort: { timestamp: -1 } },
    { $group: { _id: '$actionneur_id', lastAction: { $first: '$$ROOT' } } },
    { $lookup: { from: 'actionneurs', localField: '_id', foreignField: '_id', as: 'actionneur' } },
    { $unwind: { path: '$actionneur', preserveNullAndEmptyArrays: true } },
    { $project: { _id: 0, actionneur_id: '$_id', actionneur: { nom: '$actionneur.nom', type: '$actionneur.type' }, lastAction: 1 } }
  ]);
  res.json(agg);
};