import React, { useEffect, useState } from 'react'
import DashboardLayout from '../components/layout/DashboardLayout.jsx'

export default function Historique() {
  const [timeline, setTimeline] = useState([])
  const [statistics, setStatistics] = useState(null)
  const [period, setPeriod] = useState('24h')
  const [loading, setLoading] = useState(true)

  const fetchData = async () => {
    try {
      setLoading(true)
      
      // Fetch timeline
      const timelineRes = await fetch(`http://localhost:3000/api/historique/timeline?limit=50`)
      const timelineData = await timelineRes.json()
      setTimeline(timelineData.data || [])

      // Fetch statistics
      const statsRes = await fetch(`http://localhost:3000/api/historique/statistics?period=${period}`)
      const statsData = await statsRes.json()
      setStatistics(statsData)
      
    } catch (error) {
      console.error('Error fetching history:', error)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchData()
  }, [period])

  const getEventIcon = (type) => {
    return type === 'mesure' ? '📊' : '⚙️'
  }

  const getEventColor = (event) => {
    if (event.type === 'action') {
      return event.etat === 'ON' 
        ? 'border-l-green-500 bg-green-50' 
        : 'border-l-gray-500 bg-gray-50'
    }
    return 'border-l-blue-500 bg-blue-50'
  }

  if (loading) {
    return (
      <DashboardLayout>
        <div className="flex items-center justify-center h-64">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-brand mx-auto"></div>
            <p className="mt-4 text-gray-600">Chargement de l'historique...</p>
          </div>
        </div>
      </DashboardLayout>
    )
  }

  return (
    <DashboardLayout>
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-gray-900">Historique</h1>
        <p className="mt-2 text-gray-600">
          Visualisez l'historique complet des mesures et actions
        </p>
      </div>

      {/* Period Selector */}
      <div className="mb-6 flex items-center gap-2">
        <span className="text-sm text-gray-600">Période:</span>
        {['1h', '24h', '7d', '30d'].map((p) => (
          <button
            key={p}
            onClick={() => setPeriod(p)}
            className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
              period === p
                ? 'bg-brand text-white'
                : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
            }`}
          >
            {p === '1h' ? '1 heure' : p === '24h' ? '24 heures' : p === '7d' ? '7 jours' : '30 jours'}
          </button>
        ))}
      </div>

      {/* Statistics Grid */}
      {statistics && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
          {/* Sensor Statistics */}
          <div className="rounded-2xl bg-white shadow-soft p-6 border border-gray-100">
            <h2 className="text-lg font-semibold text-gray-800 mb-4">📊 Statistiques des Capteurs</h2>
            <div className="space-y-4">
              {statistics.sensors?.map((sensor, index) => (
                <div key={index} className="bg-gray-50 rounded-lg p-4">
                  <div className="flex items-center justify-between mb-2">
                    <span className="font-medium text-gray-900 capitalize">{sensor._id}</span>
                    <span className="text-sm text-gray-500">{sensor.count} mesures</span>
                  </div>
                  <div className="grid grid-cols-3 gap-2 text-sm">
                    <div>
                      <p className="text-gray-500">Min</p>
                      <p className="font-semibold">{sensor.min?.toFixed(2)}</p>
                    </div>
                    <div>
                      <p className="text-gray-500">Moy</p>
                      <p className="font-semibold">{sensor.avg?.toFixed(2)}</p>
                    </div>
                    <div>
                      <p className="text-gray-500">Max</p>
                      <p className="font-semibold">{sensor.max?.toFixed(2)}</p>
                    </div>
                  </div>
                </div>
              ))}
              {(!statistics.sensors || statistics.sensors.length === 0) && (
                <p className="text-sm text-gray-500 text-center py-4">Aucune donnée disponible</p>
              )}
            </div>
          </div>

          {/* Actuator Statistics */}
          <div className="rounded-2xl bg-white shadow-soft p-6 border border-gray-100">
            <h2 className="text-lg font-semibold text-gray-800 mb-4">⚙️ Statistiques des Actionneurs</h2>
            <div className="space-y-4">
              {statistics.actuators?.map((actuator, index) => (
                <div key={index} className="bg-gray-50 rounded-lg p-4">
                  <div className="flex items-center justify-between mb-2">
                    <span className="font-medium text-gray-900">{actuator.nom}</span>
                    <span className="text-sm text-gray-500">{actuator.totalActions} actions</span>
                  </div>
                  <div className="grid grid-cols-2 gap-3 text-sm">
                    <div className="flex items-center justify-between">
                      <span className="text-gray-600">🤖 Auto:</span>
                      <span className="font-semibold">{actuator.automaticActions}</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-gray-600">👤 Manuel:</span>
                      <span className="font-semibold">{actuator.manualActions}</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-gray-600">🟢 ON:</span>
                      <span className="font-semibold text-green-600">{actuator.onCount}</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-gray-600">⚪ OFF:</span>
                      <span className="font-semibold text-gray-600">{actuator.offCount}</span>
                    </div>
                  </div>
                </div>
              ))}
              {(!statistics.actuators || statistics.actuators.length === 0) && (
                <p className="text-sm text-gray-500 text-center py-4">Aucune donnée disponible</p>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Timeline */}
      <div className="rounded-2xl bg-white shadow-soft p-6 border border-gray-100">
        <h2 className="text-lg font-semibold text-gray-800 mb-4">📜 Chronologie des Événements</h2>
        
        {timeline.length === 0 ? (
          <div className="text-center py-12">
            <span className="text-4xl mb-2 block">📭</span>
            <p className="text-gray-500">Aucun événement dans la période sélectionnée</p>
          </div>
        ) : (
          <div className="space-y-3 max-h-[600px] overflow-y-auto">
            {timeline.map((event, index) => (
              <div
                key={index}
                className={`border-l-4 rounded-lg p-4 ${getEventColor(event)}`}
              >
                <div className="flex items-start gap-3">
                  <span className="text-2xl">{getEventIcon(event.type)}</span>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between mb-1">
                      <h3 className="font-semibold text-gray-900">
                        {event.type === 'mesure' ? event.capteur : event.actionneur}
                      </h3>
                      <span className="text-xs text-gray-500">
                        {new Date(event.timestamp).toLocaleString('fr-FR')}
                      </span>
                    </div>
                    <p className="text-sm text-gray-700">{event.description}</p>
                    {event.type === 'mesure' && (
                      <p className="text-xs text-gray-500 mt-1">📍 {event.emplacement}</p>
                    )}
                    {event.type === 'action' && (
                      <div className="flex items-center gap-2 mt-1">
                        <span className={`text-xs px-2 py-1 rounded-full ${
                          event.type_action === 'Automatique' 
                            ? 'bg-purple-100 text-purple-700' 
                            : 'bg-blue-100 text-blue-700'
                        }`}>
                          {event.type_action === 'Automatique' ? '🤖 Auto' : '👤 Manuel'}
                        </span>
                        <span className={`text-xs px-2 py-1 rounded-full ${
                          event.etat === 'ON' 
                            ? 'bg-green-100 text-green-700' 
                            : 'bg-gray-100 text-gray-700'
                        }`}>
                          {event.etat}
                        </span>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </DashboardLayout>
  )
}