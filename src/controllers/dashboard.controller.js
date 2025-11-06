// Dashboard controller with intelligent monitoring
// Provides real-time status and alerts for greenhouse management

import Capteur from '../models/capteur.model.js';
import Actionneur from '../models/actionneur.model.js';
import Mesure from '../models/mesure.model.js';
import HistoriqueAction from '../models/historiqueAction.model.js';
import { analyzeAllSensors } from '../utils/alerts.js';

export const getDashboardOverview = async (req, res) => {
  // Get all sensors with their last measurement
  const capteurs = await Capteur.aggregate([
    {
      $lookup: {
        from: 'mesures',
        let: { cid: '$_id' },
        pipeline: [
          { $match: { $expr: { $eq: ['$capteur_id', '$$cid'] } } },
          { $sort: { timestamp: -1 } },
          { $limit: 1 }
        ],
        as: 'lastMesure'
      }
    },
    { $unwind: { path: '$lastMesure', preserveNullAndEmptyArrays: true } },
    {
      $project: {
        _id: 0,
        capteur_id: '$_id',
        type: 1,
        unite: 1,
        emplacement: 1,
        etat: 1,
        lastMesure: 1
      }
    }
  ]);

  // Get all actuators with their last action
  const actionneurs = await Actionneur.aggregate([
    {
      $lookup: {
        from: 'historique_actions',
        let: { aid: '$_id' },
        pipeline: [
          { $match: { $expr: { $eq: ['$actionneur_id', '$$aid'] } } },
          { $sort: { timestamp: -1 } },
          { $limit: 1 }
        ],
        as: 'lastAction'
      }
    },
    { $unwind: { path: '$lastAction', preserveNullAndEmptyArrays: true } },
    {
      $project: {
        _id: 0,
        actionneur_id: '$_id',
        nom: 1,
        type: 1,
        etat: 1,
        derniere_activation: 1,
        lastAction: 1
      }
    }
  ]);

  // Analyze sensor data for alerts
  const analysis = analyzeAllSensors(capteurs);

  // Get recent measurements count (last 24 hours)
  const oneDayAgo = new Date(Date.now() - 24 * 60 * 60 * 1000);
  const recentMeasurements = await Mesure.countDocuments({
    timestamp: { $gte: oneDayAgo }
  });

  // Get recent actions count (last 24 hours)
  const recentActions = await HistoriqueAction.countDocuments({
    timestamp: { $gte: oneDayAgo }
  });

  res.json({
    message: 'Tableau de bord général',
    timestamp: new Date().toISOString(),
    capteurs: {
      total: capteurs.length,
      actifs: capteurs.filter(c => c.etat).length,
      data: capteurs
    },
    actionneurs: {
      total: actionneurs.length,
      actifs: actionneurs.filter(a => a.etat === 'ON').length,
      data: actionneurs
    },
    alertes: analysis,
    statistiques: {
      mesures_24h: recentMeasurements,
      actions_24h: recentActions
    }
  });
};

export const getSystemHealth = async (req, res) => {
  const capteurs = await Capteur.find();
  const actionneurs = await Actionneur.find();
  
  const capteursActifs = capteurs.filter(c => c.etat).length;
  const actionneursActifs = actionneurs.filter(a => a.etat === 'ON').length;
  
  // Get latest measurement
  const latestMesure = await Mesure.findOne().sort({ timestamp: -1 });
  
  // System is healthy if we have recent data (within last 10 minutes)
  const tenMinutesAgo = new Date(Date.now() - 10 * 60 * 1000);
  const isHealthy = latestMesure && latestMesure.timestamp > tenMinutesAgo;
  
  res.json({
    status: isHealthy ? 'healthy' : 'degraded',
    message: isHealthy ? 'Système opérationnel' : 'Pas de données récentes',
    timestamp: new Date().toISOString(),
    capteurs: {
      total: capteurs.length,
      actifs: capteursActifs,
      status: capteursActifs > 0 ? 'ok' : 'warning'
    },
    actionneurs: {
      total: actionneurs.length,
      actifs: actionneursActifs,
      status: 'ok'
    },
    derniere_mesure: latestMesure ? {
      type: latestMesure.type,
      valeur: latestMesure.valeur,
      timestamp: latestMesure.timestamp
    } : null
  });
};