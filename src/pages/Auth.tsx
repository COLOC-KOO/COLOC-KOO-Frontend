import React, { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { Logo } from '../components/Logo'
import { Button } from '../components/ui/Button'

export default function Auth() {
  const [mode, setMode] = useState<'signin' | 'signup'>('signin')
  const navigate = useNavigate()

  return (
    <div className="min-h-screen grid md:grid-cols-2">
      <div className="hidden md:flex bg-gradient-to-br from-brand-cyan via-brand-cyan-dark to-brand-green p-12 text-white flex-col justify-between">
        <Logo />
        <div>
          <div className="bebas text-5xl leading-none">
            Bienvenue
            <br />
            dans la coloc
            <br />
            nouvelle génération.
          </div>
          <p className="mt-4 text-white/85 max-w-sm">
            Rejoins 1 400+ colocataires à Madagascar. Annonces vérifiées, dossiers en ligne, signature simplifiée.
          </p>
        </div>
        <div className="text-xs text-white/60">© 2026 Sarintany Group</div>
      </div>

      <div className="flex items-center justify-center p-8">
        <div className="w-full max-w-sm">
          <div className="md:hidden mb-6">
            <Logo />
          </div>
          <div className="flex gap-1 p-1 bg-muted rounded-lg text-sm mb-6">
            <button
              onClick={() => setMode('signin')}
              className={`flex-1 py-2 rounded-md font-semibold ${
                mode === 'signin' ? 'bg-white shadow-sm' : 'text-muted-foreground'
              }`}
            >
              Connexion
            </button>
            <button
              onClick={() => setMode('signup')}
              className={`flex-1 py-2 rounded-md font-semibold ${
                mode === 'signup' ? 'bg-white shadow-sm' : 'text-muted-foreground'
              }`}
            >
              Inscription
            </button>
          </div>

          <h1 className="bebas text-3xl">{mode === 'signin' ? 'Content de te revoir' : 'Créer un compte'}</h1>

          <form
            className="mt-6 space-y-4"
            onSubmit={(e) => {
              e.preventDefault()
              navigate('/compte')
            }}
          >
            {mode === 'signup' && (
              <div>
                <label className="block text-xs font-semibold uppercase text-muted-foreground mb-1.5">
                  Nom complet
                </label>
                <input className="w-full border border-border rounded-lg px-3 py-2.5 text-sm bg-white" />
              </div>
            )}
            <div>
              <label className="block text-xs font-semibold uppercase text-muted-foreground mb-1.5">Email</label>
              <input type="email" className="w-full border border-border rounded-lg px-3 py-2.5 text-sm bg-white" />
            </div>
            <div>
              <label className="block text-xs font-semibold uppercase text-muted-foreground mb-1.5">
                Mot de passe
              </label>
              <input type="password" className="w-full border border-border rounded-lg px-3 py-2.5 text-sm bg-white" />
            </div>
            <Button type="submit" className="w-full bg-brand-cyan hover:bg-brand-cyan-dark text-white">
              {mode === 'signin' ? 'Se connecter' : 'Créer mon compte'}
            </Button>
            <div className="text-xs text-center text-muted-foreground">
              ou continuer avec —{' '}
              <button type="button" className="underline">
                Google
              </button>{' '}
              ·{' '}
              <button type="button" className="underline">
                Facebook
              </button>
            </div>
          </form>

          <div className="mt-6 text-xs text-center text-muted-foreground">
            <Link to="/admin" className="text-brand-cyan-dark font-semibold">
              Accès back-office admin →
            </Link>
          </div>
        </div>
      </div>
    </div>
  )
}
