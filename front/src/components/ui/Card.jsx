import React from 'react'

export default function Card({ title, subtitle, children }) {
  return (
    <div className="rounded-xl border border-gray-200 bg-white shadow-sm">
      <div className="p-6 border-b border-gray-100 text-center">
        {title ? <h2 className="text-lg font-semibold">{title}</h2> : null}
        {subtitle ? <p className="mt-1 text-sm text-gray-500">{subtitle}</p> : null}
      </div>
      <div className="p-6">
        {children}
      </div>
    </div>
  )
}