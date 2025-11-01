import React, { useEffect, useRef, useState } from 'react'
import { ResponsiveContainer, LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend } from 'recharts'



function formatTs(ts) {
  try {
    return new Date(ts).toLocaleTimeString('fr-FR', { hour12: false }).slice(0, 8)
  } catch {
    const now = new Date()
    return now.toLocaleTimeString('fr-FR', { hour12: false }).slice(0, 8)
  }
}

function buildSeries(measures = []) {
  // Sort ascending by timestamp and build step series for each type
  const sorted = [...measures].sort((a, b) => new Date(a.timestamp) - new Date(b.timestamp))
  const last = { temperature: null, humidite: null, luminosite: null, caz: null }
  const points = []
  for (const m of sorted) {
    last[m.type] = m.valeur
    points.push({
      t: formatTs(m.timestamp),
      temperature: last.temperature,
      humidite: last.humidite,
      luminosite: last.luminosite,
      caz: last.caz,
    })
  }
  // Keep only last 30 points to fit the chart
  return points.slice(-30)
}

export default function SensorsLineChart() {
  const [data, setData] = useState([])
  const timerRef = useRef(null)

  useEffect(() => {
    let mounted = true
    async function load() {
      try {
        const resp = await fetch(`${import.meta.env.VITE_BACKEND_URL}/api/mesures`, { method: 'GET' })
        const json = await resp.json()
        if (!mounted) return
        const measures = Array.isArray(json) ? json : []
        const series = buildSeries(measures)
        setData(series)
      } catch (e) {
        // Fallback: keep existing data; do not crash chart
        console.warn('SensorsLineChart: failed to load measures', e)
      }
    }
    load()
    timerRef.current = setInterval(load, 5000)
    return () => { mounted = false; clearInterval(timerRef.current) }
  }, [])

  return (
    <ResponsiveContainer width="100%" height="100%">
      <LineChart data={data} margin={{ top: 10, right: 20, left: 0, bottom: 0 }}>
        <CartesianGrid strokeDasharray="3 3" stroke="#eee" />
        <XAxis dataKey="t" tick={{ fontSize: 12 }} />
        <YAxis tick={{ fontSize: 12 }} />
        <Tooltip contentStyle={{ borderRadius: 12 }} />
        <Legend wrapperStyle={{ paddingTop: 8 }} />
        <Line type="monotone" dataKey="temperature" name="Température (°C)" stroke="#6b73ff" strokeWidth={2} dot={false} />
        <Line type="monotone" dataKey="humidite" name="Humidité (%)" stroke="#059669" strokeWidth={2} dot={false} />
        <Line type="monotone" dataKey="luminosite" name="Luminosité (lx)" stroke="#f59e0b" strokeWidth={2} dot={false} />
        <Line type="monotone" dataKey="caz" name="Gaz (MQ2)" stroke="#86b92f" strokeWidth={2} dot={false} />
      </LineChart>
    </ResponsiveContainer>
  )
}