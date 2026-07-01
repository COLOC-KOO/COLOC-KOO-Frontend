import React from 'react'
import { ArrowDownRight, ArrowUpRight } from 'lucide-react'
import { AdminLayout } from '../../components/admin/AdminLayout'
import { paymentStats, payments } from '../../data/mockData'
import { formatAr } from '../../lib/utils'

export default function AdminPaiements() {
  return (
    <AdminLayout>
      <div className="space-y-5">
        <div>
          <h1 className="bebas text-3xl text-white">Paiements</h1>
          <p className="text-white/50 text-sm">Transactions, cautions, commissions</p>
        </div>

        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          {paymentStats.map((s) => (
            <div key={s.label} className="bg-[oklch(0.22_0.005_260)] border border-white/10 rounded-2xl p-5">
              <div className="text-xs text-white/50">{s.label}</div>
              <div className="mt-2 text-2xl font-bold text-white">{s.value}</div>
              <div className={`text-xs inline-flex items-center gap-0.5 mt-1 ${s.up ? 'text-brand-green' : 'text-brand-magenta'}`}>
                {s.up ? <ArrowUpRight className="w-3 h-3" /> : <ArrowDownRight className="w-3 h-3" />} {s.delta}
              </div>
            </div>
          ))}
        </div>

        <div className="bg-[oklch(0.22_0.005_260)] border border-white/10 rounded-2xl overflow-hidden">
          <div className="p-4 border-b border-white/10">
            <h2 className="bebas text-xl text-white">Transactions récentes</h2>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="text-xs uppercase text-white/40 border-b border-white/10">
                <tr>
                  <th className="text-left p-4 font-medium">ID</th>
                  <th className="text-left font-medium">Type</th>
                  <th className="text-left font-medium">Montant</th>
                  <th className="text-left font-medium">De</th>
                  <th className="text-left font-medium">Vers</th>
                  <th className="text-left font-medium">Date</th>
                  <th className="text-left p-4 font-medium">Statut</th>
                </tr>
              </thead>
              <tbody>
                {payments.map((p) => (
                  <tr key={p.id} className="border-b border-white/5 hover:bg-white/5">
                    <td className="p-4 font-mono text-xs">{p.id}</td>
                    <td className="text-white/70">{p.type}</td>
                    <td className="font-semibold">{formatAr(p.amount)}</td>
                    <td className="text-white/60">{p.from}</td>
                    <td className="text-white/60">{p.to}</td>
                    <td className="text-white/60">{p.date}</td>
                    <td className="p-4">
                      <span
                        className={`text-[10px] font-bold px-2 py-1 rounded-full border ${
                          p.status === 'Payé'
                            ? 'text-brand-green border-brand-green/30 bg-brand-green/10'
                            : 'text-brand-olive border-brand-olive/30 bg-brand-olive/10'
                        }`}
                      >
                        {p.status}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </AdminLayout>
  )
}
