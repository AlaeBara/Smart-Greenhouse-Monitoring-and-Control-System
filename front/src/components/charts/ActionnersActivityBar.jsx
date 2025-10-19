import React, { useEffect, useRef, useState } from 'react'
import { ResponsiveContainer, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend } from 'recharts'

function nextActivity(prev = { pump: 0, fan: 0, light: 0 }) {
  const jitterCount = (n) => Math.max(0, Math.round(n + (Math.random() - 0.4) * 2))
  return {
    t: new Date().toLocaleTimeString('fr-FR', { hour12: false }).slice(0, 5),
    pump: jitterCount(prev.pump),
    fan: jitterCount(prev.fan),
    light: jitterCount(prev.light),
  }
}

export default function ActionnersActivityBar() {
  const [data, setData] = useState(() => {
    let base = nextActivity()
    const arr = [base]
    for (let i = 0; i < 12; i++) { base = nextActivity(base); arr.push(base) }
    return arr
  })
  const timerRef = useRef(null)

  useEffect(() => {
    timerRef.current = setInterval(() => {
      setData((curr) => {
        const next = nextActivity(curr[curr.length - 1])
        const slice = curr.length >= 12 ? curr.slice(1) : curr
        return [...slice, next]
      })
    }, 2000)
    return () => clearInterval(timerRef.current)
  }, [])

  return (
    <ResponsiveContainer width="100%" height="100%">
      <BarChart data={data} margin={{ top: 10, right: 20, left: 0, bottom: 0 }}>
        <CartesianGrid strokeDasharray="3 3" stroke="#eee" />
        <XAxis dataKey="t" tick={{ fontSize: 12 }} />
        <YAxis tick={{ fontSize: 12 }} />
        <Tooltip contentStyle={{ borderRadius: 12 }} />
        <Legend wrapperStyle={{ paddingTop: 8 }} />
        <Bar dataKey="pump" name="Pompe" fill="#6b73ff" radius={[6, 6, 0, 0]} />
        <Bar dataKey="fan" name="Ventilation" fill="#059669" radius={[6, 6, 0, 0]} />
        <Bar dataKey="light" name="Éclairage" fill="#f59e0b" radius={[6, 6, 0, 0]} />
      </BarChart>
    </ResponsiveContainer>
  )
}