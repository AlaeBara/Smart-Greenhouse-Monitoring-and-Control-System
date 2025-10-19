import React from 'react'

export default function MetricTile({ label, value, icon, trend }) {
  return (
    <div className="rounded-2xl bg-white shadow-soft p-5 border border-gray-100">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-sm text-gray-500">{label}</p>
          <p className="mt-1 text-2xl font-semibold text-gray-900">{value}</p>
          {trend ? (
            <p className={`mt-1 text-xs ${trend.includes('+') ? 'text-emerald-600' : 'text-rose-600'}`}>{trend}</p>
          ) : null}
        </div>
        <div className="h-10 w-10 rounded-xl bg-brand/10 grid place-items-center text-brand">
          <span className="text-lg" aria-hidden>{icon}</span>
        </div>
      </div>
    </div>
  )
}