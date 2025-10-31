import React, { useEffect, useState } from 'react'
import DashboardLayout from '../components/layout/DashboardLayout.jsx'
import { Siren ,TriangleAlert ,Check  } from 'lucide-react';

export default function Monitoring() {
  const [data, setData] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  // Fetch dashboard data from your API
  const fetchData = async () => {
    try {
      const response = await fetch(`${import.meta.env.VITE_BACKEND_URL}/api/dashboard/overview`)
      if (!response.ok) throw new Error('Failed to fetch data')
      const result = await response.json()
      setData(result)
      setError(null)
    } catch (err) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchData()
    // Refresh every 5 seconds
    const interval = setInterval(fetchData, 5000)
    return () => clearInterval(interval)
  }, [])

  // Get badge color based on alert level
  const getAlertColor = (level) => {
    switch (level) {
      case 'critical':
        return 'bg-red-100 text-red-700 border-red-300'
      case 'warning':
        return 'bg-yellow-100 text-yellow-700 border-yellow-300'
      case 'normal':
        return 'bg-green-100 text-green-700 border-green-300'
      default:
        return 'bg-gray-100 text-gray-700 border-gray-300'
    }
  }

  const getAlertIcon = (level) => {
    switch (level) {
      case 'critical':
        return '🚨'
      case 'warning':
        return '⚠️'
      case 'normal':
        return '✅'
      default:
        return '❓'
    }
  }

  if (loading) {
    return (
      <DashboardLayout>
        <div className="flex items-center justify-center h-64">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-brand mx-auto"></div>
            <p className="mt-4 text-gray-600">Chargement des données...</p>
          </div>
        </div>
      </DashboardLayout>
    )
  }

  if (error) {
    return (
      <DashboardLayout>
        <div className="rounded-2xl bg-red-50 border border-red-200 p-6">
          <div className="flex items-center gap-3">
            <span className="text-2xl">❌</span>
            <div>
              <h3 className="font-semibold text-red-900">Erreur de connexion</h3>
              <p className="text-sm text-red-700">{error}</p>
              <button 
                onClick={fetchData}
                className="mt-2 text-sm text-red-600 hover:text-red-800 underline"
              >
                Réessayer
              </button>
            </div>
          </div>
        </div>
      </DashboardLayout>
    )
  }

  return (
    <DashboardLayout>
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-gray-900">Monitoring Intelligent</h1>
        <p className="mt-2 text-gray-600">
          Surveillance en temps réel avec alertes automatiques
        </p>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        {/* Critical Alerts */}
        <div className="rounded-2xl bg-white shadow-soft p-6 border-l-4 border-red-500">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Alertes Critiques</p>
              <p className="text-3xl font-bold text-red-600 mt-1">
                {data?.alertes?.summary?.critical || 0}
              </p>
            </div>
            <div className="text-4xl"><Siren className='text-red-600' size={40}/></div>
          </div>
        </div>

        {/* Warnings */}
        <div className="rounded-2xl bg-white shadow-soft p-6 border-l-4 border-yellow-500">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Avertissements</p>
              <p className="text-3xl font-bold text-yellow-600 mt-1">
                {data?.alertes?.summary?.warning || 0}
              </p>
            </div>
            <div className="text-4xl"><TriangleAlert className='text-yellow-400' size={40}/></div>
          </div>
        </div>

        {/* Normal Status */}
        <div className="rounded-2xl bg-white shadow-soft p-6 border-l-4 border-green-500">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">État Normal</p>
              <p className="text-3xl font-bold text-green-600 mt-1">
                {data?.alertes?.summary?.normal || 0}
              </p>
            </div>
            <div className="text-4xl"><Check className='text-green-600' size={40}/></div>
          </div>
        </div>
      </div>

      {/* Statistics */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
        <div className="rounded-2xl bg-white shadow-soft p-5 border border-gray-100">
          <p className="text-sm text-gray-500">Capteurs Actifs</p>
          <p className="text-2xl font-semibold text-gray-900 mt-1">
            {data?.capteurs?.actifs || 0} / {data?.capteurs?.total || 0}
          </p>
        </div>

        <div className="rounded-2xl bg-white shadow-soft p-5 border border-gray-100">
          <p className="text-sm text-gray-500">Actionneurs Actifs</p>
          <p className="text-2xl font-semibold text-gray-900 mt-1">
            {data?.actionneurs?.actifs || 0} / {data?.actionneurs?.total || 0}
          </p>
        </div>

        <div className="rounded-2xl bg-white shadow-soft p-5 border border-gray-100">
          <p className="text-sm text-gray-500">Mesures (24h)</p>
          <p className="text-2xl font-semibold text-gray-900 mt-1">
            {data?.statistiques?.mesures_24h || 0}
          </p>
        </div>

        <div className="rounded-2xl bg-white shadow-soft p-5 border border-gray-100">
          <p className="text-sm text-gray-500">Actions (24h)</p>
          <p className="text-2xl font-semibold text-gray-900 mt-1">
            {data?.statistiques?.actions_24h || 0}
          </p>
        </div>
      </div>

      {/* Alerts Section */}
      <div className="mb-8">
        <h2 className="text-lg font-semibold text-gray-800 mb-4">
          Alertes et Recommandations
        </h2>
        
        {data?.alertes?.alerts?.length === 0 ? (
          <div className="rounded-2xl bg-green-50 border border-green-200 p-6">
            <div className="flex items-center gap-3">
              <span className="text-3xl">🎉</span>
              <div>
                <h3 className="font-semibold text-green-900">Tout va bien!</h3>
                <p className="text-sm text-green-700">Aucune alerte active. Tous les capteurs fonctionnent normalement.</p>
              </div>
            </div>
          </div>
        ) : (
          <div className="space-y-4">
            {data?.alertes?.alerts?.map((alert, index) => (
              <div
                key={index}
                className={`rounded-2xl border-2 p-6 ${getAlertColor(alert.alert.level)}`}
              >
                <div className="flex items-start gap-4">
                  <div className="text-3xl">{getAlertIcon(alert.alert.level)}</div>
                  <div className="flex-1">
                    <div className="flex items-center justify-between mb-2">
                      <h3 className="font-semibold text-lg">
                        {alert.type} - {alert.emplacement}
                      </h3>
                      <span className="text-sm font-medium opacity-75">
                        {new Date(alert.timestamp).toLocaleTimeString('fr-FR')}
                      </span>
                    </div>
                    
                    <div className="space-y-2">
                      <div className="flex items-center gap-2">
                        <span className="text-2xl font-bold">
                          {alert.valeur} {alert.unite}
                        </span>
                      </div>
                      
                      <p className="font-medium">{alert.alert.message}</p>
                      <p className="text-sm opacity-90">{alert.alert.recommendation}</p>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Sensor Details */}
      <div>
        <h2 className="text-lg font-semibold text-gray-800 mb-4">
          Détails des Capteurs
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {data?.capteurs?.data?.map((capteur, index) => (
            <div
              key={index}
              className="rounded-2xl bg-white shadow-soft p-6 border border-gray-100"
            >
              <div className="flex items-center justify-between mb-4">
                <h3 className="font-semibold text-gray-900">{capteur.type}</h3>
                <span className={`px-3 py-1 rounded-full text-xs font-medium ${
                  capteur.etat ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-700'
                }`}>
                  {capteur.etat ? '🟢 Actif' : '⚪ Inactif'}
                </span>
              </div>
              
              <p className="text-sm text-gray-600 mb-3">📍 {capteur.emplacement}</p>
              
              {capteur.lastMesure ? (
                <div className="bg-gray-50 rounded-lg p-3">
                  <p className="text-sm text-gray-600">Dernière mesure</p>
                  <p className="text-2xl font-bold text-gray-900 mt-1">
                    {capteur.lastMesure.valeur} {capteur.unite}
                  </p>
                  <p className="text-xs text-gray-500 mt-1">
                    {new Date(capteur.lastMesure.timestamp).toLocaleString('fr-FR')}
                  </p>
                </div>
              ) : (
                <div className="bg-gray-50 rounded-lg p-3 text-center">
                  <p className="text-sm text-gray-500">Aucune mesure disponible</p>
                </div>
              )}
            </div>
          ))}
        </div>
      </div>
    </DashboardLayout>
  )
}