import React from 'react'
import { Link, useLocation } from 'react-router-dom'

export default function DashboardLayout({ children }) {
  const location = useLocation()

  const navItems = [
    { id: 'overview', label: 'Aperçu', path: '/dashboard' },
    { id: 'capteurs', label: 'Capteurs', path: '/dashboard#capteurs' },
    { id: 'actionneurs', label: 'Actionneurs', path: '/dashboard#actionneurs' },
  ]

  const isActive = (path) => {
    if (path === '/dashboard') {
      return location.pathname === '/dashboard' && !location.hash
    }
    return location.pathname + location.hash === path
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="sticky top-0 z-30 bg-white/80 backdrop-blur border-b border-gray-200">
        <div className="mx-auto max-w-7xl px-6 py-4 flex items-center justify-between">
          <Link to="/dashboard" className="flex items-center gap-1 hover:opacity-80">
            <div className="h-8 w-8 rounded-lg bg-brand" />
            <div>
              <h1 className="text-md font-semibold text-gray-900">Tableau de bord</h1>
            </div>
          </Link>

          <nav className="hidden md:flex items-center gap-1">
            {navItems.map(item => (
              <Link
                key={item.id}
                to={item.path}
                className={`px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                  isActive(item.path)
                    ? 'bg-brand text-white'
                    : 'text-gray-600 hover:text-gray-900 hover:bg-gray-100'
                }`}
              >
                {item.label}
              </Link>
            ))}
            
            {/* Monitoring Button - Special styling */}
            <Link
              to="/monitoring"
              className={`ml-2 px-4 py-2 rounded-lg text-sm font-medium transition-all ${
                location.pathname === '/monitoring'
                  ? 'bg-blue-600 text-white shadow-lg'
                  : 'bg-blue-500 text-white hover:bg-blue-600 shadow-md'
              }`}
            >
              🔍 Monitoring
            </Link>
          </nav>

          <div className="flex items-center gap-2">
            <Link to="/" className="btn text-sm bg-gray-100 text-gray-700 hover:bg-gray-200">
              Déconnecter
            </Link>
          </div>
        </div>
      </header>

      <main className="mx-auto max-w-7xl px-6 py-8">
        {children}
      </main>
    </div>
  )
}