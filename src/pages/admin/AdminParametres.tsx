import React from 'react'
import { AdminLayout } from '../../components/admin/AdminLayout'
import { settingsSections } from '../../data/mockData'

export default function AdminParametres() {
  return (
    <AdminLayout>
      <div className="space-y-5 max-w-3xl">
        <div>
          <h1 className="bebas text-3xl text-white">Paramètres</h1>
          <p className="text-white/50 text-sm">Configuration de la plateforme</p>
        </div>

        {settingsSections.map((section) => (
          <div key={section.title} className="bg-[oklch(0.22_0.005_260)] border border-white/10 rounded-2xl p-6">
            <h2 className="bebas text-xl text-white mb-4">{section.title}</h2>
            <div className="grid md:grid-cols-2 gap-4">
              {section.fields.map(([label, value]) => (
                <div key={label}>
                  <label className="block text-xs font-semibold uppercase text-white/50 mb-1.5">{label}</label>
                  <input
                    defaultValue={value}
                    className="w-full bg-white/5 border border-white/10 rounded-lg px-3 py-2 text-sm outline-none"
                  />
                </div>
              ))}
            </div>
          </div>
        ))}

        <div className="flex justify-end">
          <button className="bg-brand-cyan text-[oklch(0.15_0_0)] font-semibold px-5 py-2 rounded-lg text-sm">
            Enregistrer
          </button>
        </div>
      </div>
    </AdminLayout>
  )
}
