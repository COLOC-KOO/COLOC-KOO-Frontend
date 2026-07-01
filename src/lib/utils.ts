export function formatAr(amount: number): string {
  return new Intl.NumberFormat('fr-FR').format(amount) + ' Ar'
}

export function unsplash(id: string): string {
  return `https://images.unsplash.com/photo-${id}?auto=format&fit=crop&w=1200&q=80`
}

export function cn(...classes: Array<string | false | null | undefined>): string {
  return classes.filter(Boolean).join(' ')
}
