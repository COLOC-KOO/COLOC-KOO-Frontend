import { Link } from 'react-router-dom'
import { Construction, ShieldCheck } from 'lucide-react'
import { Logo } from '../components/Logo'

export default function Maintenance() {
  return (
    <main className="min-h-screen bg-[radial-gradient(circle_at_top_left,_rgba(45,212,191,0.18),_transparent_35%),linear-gradient(135deg,_#f8fcff_0%,_#eef7f4_100%)] px-5 py-10">
      <div className="mx-auto flex min-h-[calc(100vh-5rem)] max-w-3xl flex-col items-center justify-center text-center">
        <div className="rounded-2xl bg-white px-4 py-3 shadow-sm">
          <Logo />
        </div>
        <div className="mt-12 grid h-20 w-20 place-items-center rounded-3xl bg-brand-cyan/15 text-brand-cyan-dark">
          <Construction className="h-10 w-10" aria-hidden="true" />
        </div>
        <p className="mt-7 text-sm font-semibold uppercase tracking-[0.2em] text-brand-cyan-dark">
          Coloc’KOO
        </p>
        <h1 className="bebas mt-3 text-5xl text-red-600 sm:text-6xl">
          Site en construction
        </h1>
        <p className="mt-5 max-w-xl text-base leading-7 text-slate-600">
          Notre plateforme se refait une beauté. Elle sera de nouveau accessible au public
          très bientôt. Merci pour votre patience.
        </p>
        <div className="mt-8 flex items-center gap-2 rounded-full border border-brand-green/30 bg-white/80 px-4 py-2 text-sm text-slate-600">
          <ShieldCheck className="h-4 w-4 text-brand-green-dark" aria-hidden="true" />
          Les accès de l’équipe restent disponibles.
        </div>
        <Link
          to="/auth?mode=signin&redirect=/admin"
          className="mt-6 text-sm font-semibold text-brand-cyan-dark underline-offset-4 hover:underline"
        >
          Accès réservé à l’équipe
        </Link>
      </div>
    </main>
  )
}
