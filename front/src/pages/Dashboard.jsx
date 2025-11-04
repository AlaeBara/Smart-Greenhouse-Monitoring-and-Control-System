import React, { useEffect, useState } from 'react'
import DashboardLayout from '../components/layout/DashboardLayout.jsx'
import MetricTile from '../components/ui/MetricTile.jsx'
import SensorsLineChart from '../components/charts/SensorsLineChart.jsx'
import ActionnersActivityBar from '../components/charts/ActionnersActivityBar.jsx'
import StatusBadge from '../components/ui/StatusBadge.jsx'

export default function Dashboard() {
  // Overview metrics tiles (requested): Humidité, Luminosité, Humidité du sol, Caz (MQ2)
  const [overviewMetrics, setOverviewMetrics] = useState([
    { label: 'Humidité', value: '--', icon: '💧', trend: '' },
    { label: 'Luminosité', value: '--', icon: '🔆', trend: '' },
    { label: 'Humidité du sol', value: '--', icon: '🌱', trend: '' },
    { label: 'Caz (MQ2)', value: '--', icon: '🧪', trend: '' },
  ])

  // Actuators requested: pompe d'irrigation and ventilation
  const [actuators, setActuators] = useState([
    { label: "Pompe d'irrigation", status: 'Inactif', icon: '🚰' },
    { label: 'Ventilation', status: 'Inactif', icon: '🌀' },
  ])

  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)

  // Fetch latest sensors and actuators from backend
  useEffect(() => {
    const url = `${ import.meta.env.VITE_BACKEND_URL}/api/mesures/last-capteurs-actionneurs`
    let mounted = true

    async function load() {
      try {
        setLoading(true)
        setError(null)
        const resp = await fetch(url, { method: 'GET' })
        if (!resp.ok) throw new Error(`HTTP ${resp.status}`)
        const data = await resp.json()
        if (!mounted) return

        const sensors = Array.isArray(data?.capteurs) ? data.capteurs : []
        const byType = (t) => sensors.find(s => (s.lastMesure?.type || '').toLowerCase() === t)
        const byCapteurType = (t) => sensors.find(s => (s.type || '').toLowerCase() === t)

        const humidite = byType('temperature')
        const luminosite = byType('luminosite') || byCapteurType('luminosite')
        const humiditeSol = byCapteurType('humidite_sol')
        const caz = byType('gaz')

        const formatValue = (s) => {
          if (!s || !s.lastMesure) return '--'
          const v = s.lastMesure.valeur
          const u = s.unite ? ` ${s.unite}` : ''
          return `${v}${u}`
        }

        setOverviewMetrics([
          { label: 'Humidité', value: formatValue(humidite), icon: '💧', trend: '' },
          { label: 'Luminosité', value: formatValue(luminosite), icon: '🔆', trend: '' },
          { label: 'Humidité du sol', value: formatValue(humiditeSol), icon: '🌱', trend: '' },
          { label: 'Caz (MQ2)', value: formatValue(caz), icon: '🧪', trend: '' },
        ])

        // Update actuators: keep only pump and ventilation
        const acts = Array.isArray(data?.actionneurs) ? data.actionneurs : []
        const normalizeLabel = (a) => (a.nom || a.type || '').toLowerCase()
        const isPump = (a) => /pompe|irrigation/.test(normalizeLabel(a))
        const isVent = (a) => /ventil/.test(normalizeLabel(a))

        const selected = acts.filter(a => isPump(a) || isVent(a)).map(a => ({
          label: a.nom || (isPump(a) ? "Pompe d'irrigation" : 'Ventilation'),
          status: (a.etat === 'ON' || a.lastAction?.etat === 'ON') ? 'Actif' : 'Inactif',
          icon: isPump(a) ? '🚰' : '🌀',
        }))
        if (selected.length) setActuators(selected)
      } catch (err) {
        console.error('Failed to load data', err)
        if (!mounted) return
        setError('Impossible de charger les données du backend')
      } finally {
        if (mounted) setLoading(false)
      }
    }

    load()
    const id = setInterval(load, 5000) // refresh every 15s
    return () => { mounted = false; clearInterval(id) }
  }, [])

  return (
    <DashboardLayout>
      {/* Aperçu rapide */}
      <section id="overview">
        <h2 className="text-lg font-medium text-gray-800">Aperçu</h2>
        <p className="mt-1 text-sm text-gray-500">Visualisation des métriques des capteurs et actionneurs.</p>
        {/* {loading && (
          <p className="mt-2 text-xs text-gray-400 text-center">Chargement des données…</p>
        )} */}
        {error && (
          <p className="mt-2 text-xs text-red-500 text-center">{error}</p>
        )}

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

        <div className="mt-6 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-2 gap-6">
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