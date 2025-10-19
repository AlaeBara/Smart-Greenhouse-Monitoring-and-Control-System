import React, { useState } from 'react'
import Page from '../components/layout/Page.jsx'
import Card from '../components/ui/Card.jsx'
import Input from '../components/ui/Input.jsx'
import Button from '../components/ui/Button.jsx'

export default function Login() {
  const [showPassword, setShowPassword] = useState(false)

  const handleSubmit = (e) => {
    e.preventDefault()
    // TODO: intégrer l'API de manière sécurisée (ne pas journaliser les identifiants)
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
              label={undefined}
              name="email"
              type="email"
              autoComplete="email"
              required
              placeholder="Entrez votre adresse e-mail"
            />
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
          </div>

          <div className='pt-4'>
            <Button type="submit" className="w-full hover:bg-[#6aa41b] text-white focus:ring-emerald-600">Se connecter</Button>
          </div>
        </form>
      </Card>
    </Page>
  )
}