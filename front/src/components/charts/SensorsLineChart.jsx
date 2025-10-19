import React, { useEffect, useRef, useState } from 'react'
import { ResponsiveContainer, LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend } from 'recharts'

function generatePoint(prev) {
  const now = new Date()
  const jitter = (base, min, max) => {
    const next = base + (Math.random() - 0.5) * 2
    return Math.min(max, Math.max(min, next))
  }
  const base = prev || { temp: 22, hum: 55, light: 600, soil: 40 }
  return {
    t: now.toLocaleTimeString('fr-FR', { hour12: false }).slice(0, 8),
    temp: Number(jitter(base.temp, 18, 32).toFixed(1)),
    hum: Number(jitter(base.hum, 35, 80).toFixed(1)),
    light: Math.round(jitter(base.light, 100, 1200)),
    soil: Number(jitter(base.soil, 20, 80).toFixed(1)),
  }
}

export default function SensorsLineChart() {
  const [data, setData] = useState(() => {
    const start = generatePoint()
    return Array.from({ length: 20 }).reduce((acc) => {
      const next = generatePoint(acc[acc.length - 1])
      acc.push(next)
      return acc
    }, [start])
  })
  const timerRef = useRef(null)

  useEffect(() => {
    timerRef.current = setInterval(() => {
      setData((curr) => {
        const next = generatePoint(curr[curr.length - 1])
        const slice = curr.length >= 30 ? curr.slice(1) : curr
        return [...slice, next]
      })
    }, 1500)
    return () => clearInterval(timerRef.current)
  }, [])

  return (
    <ResponsiveContainer width="100%" height="100%">
      <LineChart data={data} margin={{ top: 10, right: 20, left: 0, bottom: 0 }}>
        <CartesianGrid strokeDasharray="3 3" stroke="#eee" />
        <XAxis dataKey="t" tick={{ fontSize: 12 }} />
        <YAxis tick={{ fontSize: 12 }} />
        <Tooltip contentStyle={{ borderRadius: 12 }} />
        <Legend wrapperStyle={{ paddingTop: 8 }} />
        <Line type="monotone" dataKey="temp" name="Temp. (°C)" stroke="#6b73ff" strokeWidth={2} dot={false} />
        <Line type="monotone" dataKey="hum" name="Humidité (%)" stroke="#059669" strokeWidth={2} dot={false} />
        <Line type="monotone" dataKey="light" name="Luminosité (lx)" stroke="#f59e0b" strokeWidth={2} dot={false} yAxisId={0} />
        <Line type="monotone" dataKey="soil" name="Sol (%)" stroke="#86b92f" strokeWidth={2} dot={false} />
      </LineChart>
    </ResponsiveContainer>
  )
}