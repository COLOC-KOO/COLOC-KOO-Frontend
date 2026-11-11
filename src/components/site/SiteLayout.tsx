import React from 'react'
import { SiteHeader } from './SiteHeader'
import SiteFooter from './SiteFooter'
import { AccountSuspensionNotice } from './AccountSuspensionNotice'


export function SiteLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen flex flex-col pt-14">
      <SiteHeader />
      <AccountSuspensionNotice />
      <main className="flex-1">{children}</main>
      <SiteFooter />
    </div>
  )
}
