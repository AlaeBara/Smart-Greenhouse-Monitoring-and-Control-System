import React, { useEffect, useState } from 'react'
import DashboardLayout from '../components/layout/DashboardLayout.jsx'
import MetricTile from '../components/ui/MetricTile.jsx'
import SensorsLineChart from '../components/charts/SensorsLineChart.jsx'
import ActionnersActivityBar from '../components/charts/ActionnersActivityBar.jsx'
import StatusBadge from '../components/ui/StatusBadge.jsx'

export default function Dashboard() {
  const [actuators, setActuators] = useState([
    { label: 'Pompe d’arrosage', status: 'Inactif', icon: '🚰' },
    { label: 'Ventilation', status: 'Inactif', icon: '🌀' },
    { label: 'Éclairage', status: 'Inactif', icon: '💡' },
  ])

  useEffect(() => {
    const id = setInterval(() => {
      setActuators((curr) => curr.map((a) => {
        const rand = Math.random()
        const next = rand > 0.7 ? 'Actif' : 'Inactif'
        return { ...a, status: next }
      }))
    }, 3000)
    return () => clearInterval(id)
  }, [])

  const overviewMetrics = [
    { label: 'Température', value: '--', icon: '🌡️', trend: '+0.0°C' },
    { label: 'Humidité', value: '--', icon: '💧', trend: '-0.0%' },
    { label: 'Luminosité', value: '--', icon: '🔆', trend: '+0 lx' },
    { label: 'Humidité du sol', value: '--', icon: '🌱', trend: '+0%' },
  ]

  return (
    <DashboardLayout>
      {/* Aperçu rapide */}
      <section id="overview">
        <h2 className="text-lg font-medium text-gray-800">Aperçu</h2>
        <p className="mt-1 text-sm text-gray-500">Visualisation des métriques des capteurs et actionneurs.</p>

        <div className="mt-6 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {overviewMetrics.map((m) => (
            <MetricTile key={m.label} label={m.label} value={m.value} icon={m.icon} trend={m.trend} />
          ))}
        </div>
      </section>

      {/* Panneaux de visualisation (graphiques) */}
      <section id="capteurs" className="mt-10">
        <h2 className="text-lg font-medium text-gray-800">Tendances des capteurs</h2>
        <p className="mt-1 text-sm text-gray-500">Graphiques temps réel pour les capteurs.</p>

        <div className="mt-6 grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div className="rounded-2xl bg-white shadow-soft p-6 border border-gray-100 h-[320px]">
            <SensorsLineChart />
          </div>
          <div className="rounded-2xl bg-white shadow-soft p-6 border border-gray-100 h-[320px]">
            <ActionnersActivityBar />
          </div>
        </div>
      </section>

      <section id="actionneurs" className="mt-10">
        <h2 className="text-lg font-medium text-gray-800">État des actionneurs</h2>
        <p className="mt-1 text-sm text-gray-500">Indicateurs de statut et activité récente.</p>

        <div className="mt-6 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {actuators.map((a) => (
            <div key={a.label} className="rounded-2xl bg-white shadow-soft p-6 border border-gray-100">
              <div className="flex items-center gap-4">
                <div className="h-10 w-10 rounded-xl bg-brand/10 grid place-items-center text-brand">
                  <span className="text-lg" aria-hidden>{a.icon}</span>
                </div>
                <div className="flex-1">
                  <p className="text-sm text-gray-500">{a.label}</p>
                  <div className="mt-1">
                    <StatusBadge status={a.status} />
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </section>
    </DashboardLayout>
  )
}