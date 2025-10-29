import { Suspense, lazy } from 'react'
import { BrowserRouter, Routes, Route } from 'react-router-dom'

const Login = lazy(() => import('./pages/Login.jsx'))
const Dashboard = lazy(() => import('./pages/Dashboard.jsx'))
const Monitoring = lazy(() => import('./pages/Monitoring.jsx'))

export default function App() {
  return (
    <BrowserRouter>
      <Suspense
        fallback={
          <div className="min-h-screen grid place-items-center">
            <div
              className="inline-block h-10 w-10 animate-spin rounded-full border-4 border-solid border-gray-300 border-t-transparent"
              aria-label="Loading"
            />
          </div>
        }
      >
        <Routes>
          <Route path="/" element={<Login />} />
          <Route path="/dashboard" element={<Dashboard />} />
          <Route path="/monitoring" element={<Monitoring />} />
        </Routes>
      </Suspense>
    </BrowserRouter>
  )
}
