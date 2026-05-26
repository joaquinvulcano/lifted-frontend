'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import type { Routine } from '@/lib/types'

interface Props {
  initialRoutines: Routine[]
}

export function RoutinesClient({ initialRoutines }: Props) {
  const router = useRouter()
  const [routines, setRoutines] = useState<Routine[]>(initialRoutines)
  const [newName, setNewName] = useState('')
  const [newDesc, setNewDesc] = useState('')
  const [creating, setCreating] = useState(false)
  const [showForm, setShowForm] = useState(false)

  async function handleCreate() {
    if (!newName.trim()) return
    setCreating(true)
    const res = await fetch('/api/routines', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ name: newName, description: newDesc }),
    })
    if (res.ok) {
      const created = await res.json()
      setRoutines((prev) => [...prev, created])
      setNewName('')
      setNewDesc('')
      setShowForm(false)
    }
    setCreating(false)
  }

  async function handleActivate(id: number) {
    await fetch(`/api/routines/${id}/activate`, { method: 'POST' })
    setRoutines((prev) =>
      prev.map((r) => ({ ...r, isActive: r.id === id }))
    )
  }

  async function handleDelete(id: number) {
    if (!confirm('¿Eliminar esta rutina y todos sus días?')) return
    await fetch(`/api/routines/${id}`, { method: 'DELETE' })
    setRoutines((prev) => prev.filter((r) => r.id !== id))
  }

  return (
    <div className="min-h-screen bg-black px-4 pb-8 pt-8">
      <div className="mb-6 flex items-center justify-between">
        <div>
          <button
            onClick={() => router.push('/')}
            className="mb-1 text-xs font-semibold uppercase tracking-widest text-zinc-500"
          >
            ← Inicio
          </button>
          <h1 className="text-4xl font-black text-white">Rutinas</h1>
        </div>
        <div className="flex gap-2">
          <button
            onClick={() => router.push('/exercises')}
            className="rounded-xl border border-zinc-700 px-3 py-2 text-xs font-semibold text-zinc-400 active:scale-95 transition-transform"
          >
            Ejercicios
          </button>
          <button
            onClick={() => setShowForm((v) => !v)}
            className="rounded-xl bg-white px-4 py-2 text-sm font-bold text-black active:scale-95 transition-transform"
          >
            + Nueva
          </button>
        </div>
      </div>

      {showForm && (
        <div className="mb-6 rounded-2xl border border-zinc-700 bg-zinc-900 p-4 flex flex-col gap-3">
          <input
            type="text"
            placeholder="Nombre de la rutina"
            value={newName}
            onChange={(e) => setNewName(e.target.value)}
            className="w-full rounded-xl bg-zinc-800 px-4 py-3 text-white placeholder:text-zinc-500 focus:outline-none focus:ring-2 focus:ring-white"
          />
          <input
            type="text"
            placeholder="Descripción (opcional)"
            value={newDesc}
            onChange={(e) => setNewDesc(e.target.value)}
            className="w-full rounded-xl bg-zinc-800 px-4 py-3 text-white placeholder:text-zinc-500 focus:outline-none focus:ring-2 focus:ring-white"
          />
          <button
            onClick={handleCreate}
            disabled={creating || !newName.trim()}
            className="w-full rounded-xl bg-white py-3 font-bold text-black disabled:opacity-50 active:scale-95 transition-transform"
          >
            {creating ? 'Creando...' : 'Crear rutina'}
          </button>
        </div>
      )}

      <div className="flex flex-col gap-4">
        {routines.map((routine) => (
          <div
            key={routine.id}
            className={`rounded-2xl border-2 p-5 flex flex-col gap-3 ${
              routine.isActive
                ? 'border-white bg-zinc-900'
                : 'border-zinc-700 bg-zinc-900/50'
            }`}
          >
            <div className="flex items-start justify-between gap-2">
              <div>
                <h2 className="text-xl font-bold text-white leading-tight">{routine.name}</h2>
                {routine.description && (
                  <p className="mt-0.5 text-sm text-zinc-400">{routine.description}</p>
                )}
                <p className="mt-1 text-xs text-zinc-500">{routine.dayCount} días</p>
              </div>
              {routine.isActive && (
                <span className="shrink-0 rounded-full bg-white px-3 py-1 text-xs font-bold text-black">
                  Activa
                </span>
              )}
            </div>

            <div className="flex gap-2">
              <button
                onClick={() => router.push(`/routines/${routine.id}`)}
                className="flex-1 rounded-xl bg-zinc-700 py-3 text-sm font-bold text-white active:scale-95 transition-transform"
              >
                Editar
              </button>
              {!routine.isActive && (
                <button
                  onClick={() => handleActivate(routine.id)}
                  className="flex-1 rounded-xl bg-zinc-600 py-3 text-sm font-bold text-white active:scale-95 transition-transform"
                >
                  Activar
                </button>
              )}
              {!routine.isActive && (
                <button
                  onClick={() => handleDelete(routine.id)}
                  className="rounded-xl bg-red-900/40 border border-red-800 px-4 py-3 text-sm font-bold text-red-400 active:scale-95 transition-transform"
                >
                  Eliminar
                </button>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
