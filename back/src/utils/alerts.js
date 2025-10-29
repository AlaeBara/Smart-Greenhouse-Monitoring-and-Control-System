// Smart alert system for greenhouse monitoring
// Checks if sensor values are within safe ranges

export const THRESHOLDS = {
  temperature: {
    min: 15,
    max: 30,
    optimal_min: 18,
    optimal_max: 25,
    unit: '°C'
  },
  humidite: {
    min: 30,
    max: 80,
    optimal_min: 40,
    optimal_max: 70,
    unit: '%'
  },
  luminosite: {
    min: 200,
    max: 1500,
    optimal_min: 400,
    optimal_max: 1000,
    unit: 'lux'
  }
};

export function getAlertLevel(type, value) {
  const threshold = THRESHOLDS[type];
  if (!threshold) return { level: 'unknown', message: 'Type de capteur inconnu' };

  if (value < threshold.min) {
    return {
      level: 'critical',
      message: `⚠️ CRITIQUE: ${type} trop basse (${value}${threshold.unit})`,
      recommendation: `Valeur actuelle: ${value}${threshold.unit}. Minimum requis: ${threshold.min}${threshold.unit}`
    };
  }

  if (value > threshold.max) {
    return {
      level: 'critical',
      message: `⚠️ CRITIQUE: ${type} trop élevée (${value}${threshold.unit})`,
      recommendation: `Valeur actuelle: ${value}${threshold.unit}. Maximum autorisé: ${threshold.max}${threshold.unit}`
    };
  }

  if (value < threshold.optimal_min || value > threshold.optimal_max) {
    return {
      level: 'warning',
      message: `⚡ ATTENTION: ${type} hors de la plage optimale`,
      recommendation: `Valeur actuelle: ${value}${threshold.unit}. Plage optimale: ${threshold.optimal_min}-${threshold.optimal_max}${threshold.unit}`
    };
  }

  return {
    level: 'normal',
    message: `✅ ${type} dans la plage normale`,
    recommendation: `Valeur actuelle: ${value}${threshold.unit}. Conditions optimales.`
  };
}

export function analyzeAllSensors(sensors) {
  const alerts = [];
  const summary = {
    critical: 0,
    warning: 0,
    normal: 0
  };

  sensors.forEach(sensor => {
    if (sensor.lastMesure) {
      const alert = getAlertLevel(sensor.lastMesure.type, sensor.lastMesure.valeur);
      
      alerts.push({
        capteur_id: sensor.capteur_id,
        type: sensor.type,
        emplacement: sensor.emplacement,
        valeur: sensor.lastMesure.valeur,
        unite: sensor.unite,
        timestamp: sensor.lastMesure.timestamp,
        alert: alert
      });

      summary[alert.level]++;
    }
  });

  // Sort by severity: critical first, then warning, then normal
  const severityOrder = { critical: 0, warning: 1, normal: 2 };
  alerts.sort((a, b) => severityOrder[a.alert.level] - severityOrder[b.alert.level]);

  return {
    summary,
    alerts,
    total: alerts.length,
    needsAttention: summary.critical + summary.warning
  };
}