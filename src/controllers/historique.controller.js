// Historique Controller - Provides historical data analysis and trends
// Shows past sensor readings, actuator actions, and system events

import Mesure from '../models/mesure.model.js';
import HistoriqueAction from '../models/historiqueAction.model.js';
import Capteur from '../models/capteur.model.js';
import Actionneur from '../models/actionneur.model.js';

// Get sensor measurements history with filters
export const getMesuresHistory = async (req, res) => {
  const { capteur_id, type, startDate, endDate, limit = 100 } = req.query;

  // Build filter query
  const filter = {};
  if (capteur_id) filter.capteur_id = capteur_id;
  if (type) filter.type = type;
  
  // Date range filter
  if (startDate || endDate) {
    filter.timestamp = {};
    if (startDate) filter.timestamp.$gte = new Date(startDate);
    if (endDate) filter.timestamp.$lte = new Date(endDate);
  }

  const mesures = await Mesure.find(filter)
    .sort({ timestamp: -1 })
    .limit(parseInt(limit))
    .populate('capteur_id', 'type unite emplacement');

  res.json({
    message: 'Historique des mesures',
    total: mesures.length,
    data: mesures
  });
};

// Get actuator actions history with filters
export const getActionsHistory = async (req, res) => {
  const { actionneur_id, type_action, startDate, endDate, limit = 100 } = req.query;

  const filter = {};
  if (actionneur_id) filter.actionneur_id = actionneur_id;
  if (type_action) filter.type_action = type_action;
  
  if (startDate || endDate) {
    filter.timestamp = {};
    if (startDate) filter.timestamp.$gte = new Date(startDate);
    if (endDate) filter.timestamp.$lte = new Date(endDate);
  }

  const actions = await HistoriqueAction.find(filter)
    .sort({ timestamp: -1 })
    .limit(parseInt(limit))
    .populate('actionneur_id', 'nom type');

  res.json({
    message: 'Historique des actions',
    total: actions.length,
    data: actions
  });
};

// Get aggregated statistics for a time period
export const getStatistics = async (req, res) => {
  const { period = '24h' } = req.query;

  // Calculate time range
  const now = new Date();
  let startDate;
  switch (period) {
    case '1h':
      startDate = new Date(now - 60 * 60 * 1000);
      break;
    case '24h':
      startDate = new Date(now - 24 * 60 * 60 * 1000);
      break;
    case '7d':
      startDate = new Date(now - 7 * 24 * 60 * 60 * 1000);
      break;
    case '30d':
      startDate = new Date(now - 30 * 24 * 60 * 60 * 1000);
      break;
    default:
      startDate = new Date(now - 24 * 60 * 60 * 1000);
  }

  // Aggregate sensor statistics
  const sensorStats = await Mesure.aggregate([
    { $match: { timestamp: { $gte: startDate } } },
    {
      $group: {
        _id: '$type',
        count: { $sum: 1 },
        avg: { $avg: '$valeur' },
        min: { $min: '$valeur' },
        max: { $max: '$valeur' },
        latest: { $last: '$valeur' }
      }
    }
  ]);

  // Aggregate actuator statistics
  const actuatorStats = await HistoriqueAction.aggregate([
    { $match: { timestamp: { $gte: startDate } } },
    {
      $group: {
        _id: '$actionneur_id',
        totalActions: { $sum: 1 },
        automaticActions: {
          $sum: { $cond: [{ $eq: ['$type_action', 'Automatique'] }, 1, 0] }
        },
        manualActions: {
          $sum: { $cond: [{ $eq: ['$type_action', 'Manuel'] }, 1, 0] }
        },
        onCount: {
          $sum: { $cond: [{ $eq: ['$etat', 'ON'] }, 1, 0] }
        },
        offCount: {
          $sum: { $cond: [{ $eq: ['$etat', 'OFF'] }, 1, 0] }
        }
      }
    },
    {
      $lookup: {
        from: 'actionneurs',
        localField: '_id',
        foreignField: '_id',
        as: 'actionneur'
      }
    },
    { $unwind: '$actionneur' },
    {
      $project: {
        actionneur_id: '$_id',
        nom: '$actionneur.nom',
        type: '$actionneur.type',
        totalActions: 1,
        automaticActions: 1,
        manualActions: 1,
        onCount: 1,
        offCount: 1
      }
    }
  ]);

  res.json({
    message: `Statistiques pour ${period}`,
    period,
    startDate,
    endDate: now,
    sensors: sensorStats,
    actuators: actuatorStats
  });
};

// Get timeline - combined view of measurements and actions
export const getTimeline = async (req, res) => {
  const { startDate, endDate, limit = 50 } = req.query;

  const filter = {};
  if (startDate || endDate) {
    filter.timestamp = {};
    if (startDate) filter.timestamp.$gte = new Date(startDate);
    if (endDate) filter.timestamp.$lte = new Date(endDate);
  }

  // Get recent measurements
  const mesures = await Mesure.find(filter)
    .sort({ timestamp: -1 })
    .limit(parseInt(limit) / 2)
    .populate('capteur_id', 'type unite emplacement')
    .lean();

  // Get recent actions
  const actions = await HistoriqueAction.find(filter)
    .sort({ timestamp: -1 })
    .limit(parseInt(limit) / 2)
    .populate('actionneur_id', 'nom type')
    .lean();

  // Combine and format timeline
  const timeline = [
    ...mesures.map(m => ({
      type: 'mesure',
      timestamp: m.timestamp,
      capteur: m.capteur_id?.type || 'Unknown',
      emplacement: m.capteur_id?.emplacement || 'Unknown',
      mesure_type: m.type,
      valeur: m.valeur,
      unite: m.capteur_id?.unite || '',
      description: `${m.capteur_id?.type || 'Capteur'} a mesuré ${m.valeur}${m.capteur_id?.unite || ''}`
    })),
    ...actions.map(a => ({
      type: 'action',
      timestamp: a.timestamp,
      actionneur: a.actionneur_id?.nom || 'Unknown',
      actionneur_type: a.actionneur_id?.type || 'Unknown',
      type_action: a.type_action,
      etat: a.etat,
      description: `${a.actionneur_id?.nom || 'Actionneur'} ${a.etat === 'ON' ? 'activé' : 'désactivé'} (${a.type_action})`
    }))
  ];

  // Sort by timestamp (most recent first)
  timeline.sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp));

  res.json({
    message: 'Timeline des événements',
    total: timeline.length,
    data: timeline.slice(0, parseInt(limit))
  });
};

// Get hourly trends for charts (last 24 hours)
export const getHourlyTrends = async (req, res) => {
  const { type } = req.query;
  const now = new Date();
  const startDate = new Date(now - 24 * 60 * 60 * 1000);

  const filter = { timestamp: { $gte: startDate } };
  if (type) filter.type = type;

  const trends = await Mesure.aggregate([
    { $match: filter },
    {
      $group: {
        _id: {
          type: '$type',
          hour: { $dateToString: { format: '%Y-%m-%d %H:00', date: '$timestamp' } }
        },
        avg: { $avg: '$valeur' },
        min: { $min: '$valeur' },
        max: { $max: '$valeur' },
        count: { $sum: 1 }
      }
    },
    { $sort: { '_id.hour': 1 } },
    {
      $project: {
        _id: 0,
        type: '$_id.type',
        hour: '$_id.hour',
        avg: { $round: ['$avg', 2] },
        min: { $round: ['$min', 2] },
        max: { $round: ['$max', 2] },
        count: 1
      }
    }
  ]);

  res.json({
    message: 'Tendances horaires (24h)',
    period: '24h',
    data: trends
  });
};