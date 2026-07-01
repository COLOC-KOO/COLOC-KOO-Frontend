import React, { useState } from 'react'
import { CircleAlert, MessageSquare } from 'lucide-react'
import { AdminLayout } from '../../components/admin/AdminLayout'
import { conversations } from '../../data/mockData'

export default function AdminMessages() {
  const [active, setActive] = useState(0)
  const selected = conversations[active]

  return (
    <AdminLayout>
      <div className="space-y-5">
        <div>
          <h1 className="bebas text-3xl text-white">Messages & signalements</h1>
          <p className="text-white/50 text-sm">Support utilisateurs et modération</p>
        </div>

        <div className="grid lg:grid-cols-[380px_1fr] gap-4">
          <div className="bg-[oklch(0.22_0.005_260)] border border-white/10 rounded-2xl overflow-hidden">
            {conversations.map((c, i) => (
              <button
                key={i}
                onClick={() => setActive(i)}
                className={`w-full text-left p-4 border-b border-white/5 hover:bg-white/5 ${i === active ? 'bg-white/5' : ''}`}
              >
                <div className="flex items-center justify-between gap-2">
                  <div className="font-semibold text-sm flex items-center gap-2">
                    {c.flag && <CircleAlert className="w-4 h-4 text-brand-magenta" />}
                    {c.user}
                  </div>
                  <div className="text-xs text-white/40">{c.date}</div>
                </div>
                <div className="text-sm text-white/80 mt-0.5">{c.subject}</div>
                <div className="text-xs text-white/50 mt-1 truncate">{c.preview}</div>
                {c.unread && <span className="inline-block mt-2 w-2 h-2 rounded-full bg-brand-cyan" />}
              </button>
            ))}
          </div>

          <div className="bg-[oklch(0.22_0.005_260)] border border-white/10 rounded-2xl p-6 flex flex-col min-h-[500px]">
            <div className="pb-4 border-b border-white/10">
              <div className="font-semibold text-white">{selected.user}</div>
              <div className="text-xs text-white/50">{selected.subject} · C-1042</div>
            </div>
            <div className="flex-1 py-4 space-y-4">
              <div className="flex gap-3">
                <div className="w-8 h-8 rounded-full bg-brand-green/20 text-brand-green flex items-center justify-center text-xs font-bold shrink-0">
                  {selected.user[0]}
                </div>
                <div className="bg-white/5 rounded-2xl rounded-tl-none p-3 text-sm max-w-md">{selected.preview}</div>
              </div>
              <div className="flex gap-3 justify-end">
                <div className="bg-brand-cyan/20 border border-brand-cyan/30 rounded-2xl rounded-tr-none p-3 text-sm max-w-md">
                  Bonjour, essayez PDF &lt; 5Mo. On regarde ça.
                </div>
                <div className="w-8 h-8 rounded-full bg-brand-cyan text-[oklch(0.15_0_0)] flex items-center justify-center text-xs font-bold shrink-0">
                  A
                </div>
              </div>
            </div>
            <div className="flex items-center gap-2 pt-4 border-t border-white/10">
              <MessageSquare className="w-4 h-4 text-white/40" />
              <input placeholder="Répondre..." className="flex-1 bg-white/5 border border-white/10 rounded-lg px-3 py-2 text-sm outline-none" />
              <button className="bg-brand-cyan text-[oklch(0.15_0_0)] font-semibold px-4 py-2 rounded-lg text-sm">
                Envoyer
              </button>
            </div>
          </div>
        </div>
      </div>
    </AdminLayout>
  )
}
