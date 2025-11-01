import React from 'react'

export default function StatusBadge({ status = 'Inactif' }) {
  const isActive = status.toLowerCase().includes('actif')
  const color = isActive ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-700'
  const dot = isActive ? 'bg-green-500' : 'bg-gray-400'
  return (
    <span className={`inline-flex items-center gap-2 rounded-full px-3 py-1 text-xs font-medium ${color}`}>
      <span className={`h-2.5 w-2.5 rounded-full ${dot}`} />
      {status}
    </span>
  )
}