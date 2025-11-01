import React, { useEffect, useRef, useState } from 'react'
import { ResponsiveContainer, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend } from 'recharts'

const BASE_URL = import.meta.env.VITE_BACKEND_URL || 'http://localhost:3000'

function formatMin(ts) {
  return new Date(ts).toLocaleTimeString('fr-FR', { hour12: false }).slice(0, 5)
}

function isPump(a) {
  const s = (a?.actionneur_id?.nom || a?.actionneur_id?.type || '').toLowerCase()
  return /pompe|irrigation/.test(s)
}

function isVent(a) {
  const s = (a?.actionneur_id?.nom || a?.actionneur_id?.type || '').toLowerCase()
  return /ventil/.test(s)
}

function buildBars(actions = []) {
  // Persist binary ON/OFF state per minute (carry forward last known state)
  const sorted = [...actions].sort((a, b) => new Date(a.timestamp) - new Date(b.timestamp))
  const truncMin = (ts) => Math.floor(new Date(ts).getTime() / 60000)
  const nowMin = Math.floor(Date.now() / 60000)
  const minuteKeys = []
  for (let i = 11; i >= 0; i--) minuteKeys.push(nowMin - i)
  const labels = minuteKeys.map((k) => formatMin(new Date(k * 60000)))
  const buckets = labels.map((t) => ({ t, pump: 0, fan: 0 }))

  let state = { pump: 0, fan: 0 }
  let ai = 0
  for (let bi = 0; bi < minuteKeys.length; bi++) {
    const key = minuteKeys[bi]
    while (ai < sorted.length && truncMin(sorted[ai].timestamp) <= key) {
      const a = sorted[ai]
      const val = a.etat === 'ON' ? 1 : 0
      if (isPump(a)) state.pump = val
      else if (isVent(a)) state.fan = val
      ai++
    }
    buckets[bi].pump = state.pump ? 1 : 0
    buckets[bi].fan = state.fan ? 1 : 0
  }
  return buckets
}

export default function ActionnersActivityBar() {
  const [data, setData] = useState([])
  const timerRef = useRef(null)

  useEffect(() => {
    let mounted = true
    async function load() {
      try {
        const resp = await fetch(`${BASE_URL}/api/historique-actions`, { method: 'GET' })
        const json = await resp.json()
        if (!mounted) return
        const actions = Array.isArray(json) ? json : []
        const series = buildBars(actions)
        setData(series)
      } catch (e) {
        console.warn('ActionnersActivityBar: failed to load actions', e)
      }
    }
    load()
    timerRef.current = setInterval(load, 5000)
    return () => { mounted = false; clearInterval(timerRef.current) }
  }, [])

  return (
    <ResponsiveContainer width="100%" height="100%">
      <BarChart data={data} margin={{ top: 10, right: 20, left: 0, bottom: 0 }}>
        <CartesianGrid strokeDasharray="3 3" stroke="#eee" />
        <XAxis dataKey="t" tick={{ fontSize: 12 }} />
        <YAxis tick={{ fontSize: 12 }} domain={[0, 1]} ticks={[0, 1]} allowDecimals={false} />
        <Tooltip contentStyle={{ borderRadius: 12 }} />
        <Legend wrapperStyle={{ paddingTop: 8 }} />
        <Bar dataKey="pump" name="Pompe" fill="#6b73ff" radius={[6, 6, 0, 0]} />
        <Bar dataKey="fan" name="Ventilation" fill="#059669" radius={[6, 6, 0, 0]} />
      </BarChart>
    </ResponsiveContainer>
  )
}