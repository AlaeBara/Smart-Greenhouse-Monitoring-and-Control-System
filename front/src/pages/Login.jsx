import React, { useState } from 'react'
import Page from '../components/layout/Page.jsx'
import Card from '../components/ui/Card.jsx'
import Input from '../components/ui/Input.jsx'
import Button from '../components/ui/Button.jsx'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext.jsx'

export default function Login() {
  const [showPassword, setShowPassword] = useState(false)
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [errors, setErrors] = useState({})
  const [loading, setLoading] = useState(false)
  const [feedback, setFeedback] = useState('')
  const navigate = useNavigate()
  const { login } = useAuth()

  const validate = () => {
    const next = {}
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    if (!email || !emailRegex.test(email)) {
      next.email = 'Veuillez entrer une adresse e-mail valide'
    }
    if (!password || password.length < 6) {
      next.password = 'Le mot de passe doit contenir au moins 6 caractères'
    }
    setErrors(next)
    return Object.keys(next).length === 0
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setFeedback('')
    if (!validate()) return
    setLoading(true)
    try {
      await login(email, password)
      navigate('/dashboard')
    } catch (err) {
      setFeedback(err?.message || 'Échec de la connexion')
    } finally {
      setLoading(false)
    }
  }

  return (
    <Page>
      <Card title="Bienvenue sur le tableau de bord de la serre" subtitle="Gérez votre serre intelligente">
        <form className="space-y-4" onSubmit={handleSubmit} noValidate>
          <div>
            <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-1">
              Adresse e-mail <span className="text-red-500">*</span>
            </label>
            <Input
              id="email"
              name="email"
              type="email"
              autoComplete="email"
              required
              placeholder="Entrez votre adresse e-mail"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              aria-invalid={!!errors.email}
            />
            {errors.email && (
              <p className="mt-1 text-sm text-red-600" role="alert">{errors.email}</p>
            )}
          </div>

          <div>
            <label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-1">
              Mot de passe <span className="text-red-500">*</span>
            </label>
            <div className="mt-2 relative">
              <input
                id="password"
                name="password"
                type={showPassword ? 'text' : 'password'}
                autoComplete="current-password"
                required
                minLength={8}
                placeholder="Entrez votre mot de passe"
                className="input border-gray-300 bg-white pr-10"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                aria-invalid={!!errors.password}
              />
              <button
                type="button"
                aria-label={showPassword ? 'Masquer le mot de passe' : 'Afficher le mot de passe'}
                className="absolute inset-y-0 right-2 my-auto inline-flex h-8 w-8 items-center justify-center rounded-md text-gray-500 hover:text-gray-700"
                onClick={() => setShowPassword((v) => !v)}
              >
                {showPassword ? (
                  <span className="text-lg" role="img" aria-hidden="true">🙈</span>
                ) : (
                  <span className="text-lg" role="img" aria-hidden="true">👁️</span>
                )}
              </button>
            </div>
            {errors.password && (
              <p className="mt-1 text-sm text-red-600" role="alert">{errors.password}</p>
            )}
          </div>

          {feedback && (
            <div className="rounded-md bg-red-50 border border-red-200 p-3 text-sm text-red-700 text-center" role="alert">
              {feedback}
            </div>
          )}

          <div className='pt-4'>
            <Button 
              type="submit" 
              className={`w-full text-white focus:ring-emerald-600 ${loading ? 'opacity-70 cursor-not-allowed' : 'hover:bg-[#6aa41b]'}`}
              disabled={loading}
            >
              {loading ? 'Connexion…' : 'Se connecter'}
            </Button>
          </div>
        </form>
      </Card>
    </Page>
  )
}