import { useState } from 'react'
import { Home, MapPin, Users } from 'lucide-react'
import { useTranslation } from 'react-i18next'
import { LazyImage } from '../ui/LazyImage'

const HERO_BG = 'https://images.unsplash.com/photo-1600585154340-be6161a56a0c?w=1200&q=80'

type HomeHeroProps = { mode: 'chercher' | 'proposer'; onModeChange: (mode: 'chercher' | 'proposer') => void; searchTerm: string; onSearchTermChange: (value: string) => void; suggestions: string[]; onSearch: () => void }

export function HomeHero({ mode, onModeChange, searchTerm, onSearchTermChange, suggestions, onSearch }: HomeHeroProps) {
  const [showSuggestions, setShowSuggestions] = useState(false)
  const [hasSelectedCity, setHasSelectedCity] = useState(false)
  const [searchMessage, setSearchMessage] = useState('')
  const { t } = useTranslation(['home', 'common'])
  const [titleStart, ...titleEnd] = t('home:hero.title').split(',')
  const visibleSuggestions = suggestions.slice(0, 8)
  const chooseCity = (city: string) => { onSearchTermChange(city); setHasSelectedCity(true); setSearchMessage(''); setShowSuggestions(false) }
  const submitSearch = () => {
    if (!hasSelectedCity) {
      setSearchMessage('Choisissez d’abord une ville proposée.')
      setShowSuggestions(true)
      return
    }
    onSearch()
  }

  const filteredSuggestions = searchTerm
    ? suggestions.filter((city) => city.toLowerCase().includes(searchTerm.toLowerCase())).slice(0, 8)
    : visibleSuggestions

  return <section className="relative min-h-[300px] overflow-visible bg-gray-900">
    <LazyImage src={HERO_BG} alt={t('home:hero.title')} className="absolute inset-0 h-full w-full object-cover" />
    <div className="absolute inset-0 bg-gradient-to-r from-black/90 via-black/60 to-black/10" />
    <div className="relative z-10 flex flex-col items-center px-4 py-8 pb-7 text-center">
      <h1 className="bebas mb-1.5 px-4 text-[40px] leading-tight tracking-wide text-white">{titleStart}{titleEnd.length ? ',' : ''} <span className="text-brand-green">{titleEnd.join(',')}</span></h1>
      <p className="mb-5 text-[13px] italic text-white/65">{t('home:hero.subtitle')}</p>
      <div className="mb-4 flex flex-col gap-2.5 sm:flex-row">
        <button type="button" onClick={() => { onModeChange('chercher'); setShowSuggestions(true) }} className={`flex items-center justify-center gap-1.5 rounded-3xl border-2 px-6 py-2.5 text-sm font-bold transition-all ${mode === 'chercher' ? 'border-brand-cyan bg-brand-cyan text-white' : 'border-white/50 bg-transparent text-white/85 hover:border-white hover:text-white'}`}><Users className="h-4 w-4" />{t('home:hero.search')}</button>
        <button type="button" onClick={() => { onModeChange('proposer'); setShowSuggestions(true) }} className={`flex items-center justify-center gap-1.5 rounded-3xl border-2 px-6 py-2.5 text-sm font-bold transition-all ${mode === 'proposer' ? 'border-brand-green bg-brand-green text-white' : 'border-white/50 bg-transparent text-white/85 hover:border-white hover:text-white'}`}><Home className="h-4 w-4" />{t('home:hero.propose')}</button>
      </div>
      <div className="relative w-full max-w-[680px] sm:w-4/5">
        <form onSubmit={(event) => { event.preventDefault(); submitSearch() }}>
          <div className="flex items-center gap-2 rounded-xl bg-white py-1.5 pl-3.5 pr-1.5 shadow-lg">
            <MapPin className="h-5 w-5 shrink-0 text-brand-cyan" />
            <input
              type="text"
              autoComplete="off"
              spellCheck={false}
              value={searchTerm}
              placeholder={t('home:hero.placeholder')}
              onChange={(event) => { onSearchTermChange(event.target.value); setHasSelectedCity(false); setShowSuggestions(true) }}
              onClick={() => setShowSuggestions(true)}
              onFocus={() => setShowSuggestions(true)}
              className="min-w-0 flex-1 bg-transparent text-sm text-foreground outline-none placeholder:text-slate-400"
            />
            <button type="submit" className="shrink-0 rounded-lg bg-brand-green px-4 py-2 text-xs font-bold text-white transition-colors hover:bg-brand-green-dark">
              {t('common:common.search')}
            </button>
          </div>
        </form>
        {showSuggestions && filteredSuggestions.length > 0 && (
          <div className="absolute left-0 right-0 top-full z-50 mt-1 overflow-hidden rounded-xl border border-gray-100 bg-white text-left shadow-xl">
            {filteredSuggestions.map((city) => (
              <button
                key={city}
                type="button"
                onMouseDown={() => chooseCity(city)}
                className="flex w-full items-center gap-2 border-b border-gray-100 px-3.5 py-2.5 text-left text-sm text-foreground transition-colors last:border-none hover:bg-gray-50"
              >
                <MapPin className="h-4 w-4 shrink-0 text-brand-cyan" />
                <span className="flex-1">{city}</span>
              </button>
            ))}
          </div>
        )}
      </div>
      {searchMessage && <p className="mt-2 text-xs font-medium text-amber-200">{searchMessage}</p>}
      <div className="mt-5 flex gap-4 rounded-xl bg-white/10 px-5 py-2.5">{[['120+', t('home:featured.title')], ['12', t('home:cities.title')], ['850+', t('home:hero.colocataires')]].map(([number, label], index) => <div key={label} className={`text-center ${index > 0 ? 'border-l border-white/15 pl-4' : ''}`}><div className="bebas text-2xl tracking-wide text-white">{number}</div><div className="mt-0.5 text-[10px] text-white/50">{label}</div></div>)}</div>
    </div>
  </section>
}
