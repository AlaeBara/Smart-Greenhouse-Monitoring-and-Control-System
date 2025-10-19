import React from 'react'
import { Link } from 'react-router-dom'

export default function DashboardLayout({ children }) {
  const navItems = [
    { id: 'overview', label: 'Aperçu' },
    { id: 'capteurs', label: 'Capteurs' },
    { id: 'actionneurs', label: 'Actionneurs' },
  ]

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="sticky top-0 z-30 bg-white/80 backdrop-blur border-b border-gray-200">
        <div className="mx-auto max-w-7xl px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-1">
            <div className="h-8 w-8 rounded-lg bg-brand" />
            <div>
              <h1 className="text-md font-semibold text-gray-900">Tableau de bord</h1>
            </div>
          </div>

          <nav className="hidden md:flex items-center gap-1">
            {navItems.map(item => (
              <a key={item.id} href={`#${item.id}`} className="px-3 py-2 rounded-lg text-sm font-medium text-gray-600 hover:text-gray-900 hover:bg-gray-100">
                {item.label}
              </a>
            ))}
          </nav>

          <div className="flex items-center gap-2">
            <Link to="/" className="btn text-sm bg-gray-100 text-gray-700 hover:bg-gray-200">Déconnecter</Link>
          </div>
        </div>
      </header>

      <main className="mx-auto max-w-7xl px-6 py-8">
        {children}
      </main>
    </div>
  )
}