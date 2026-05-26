'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'

interface Exercise {
  id: number
  name: string
  default_equipment: string
}

interface Props {
  initialExercises: Exercise[]
}

export function ExercisesClient({ initialExercises }: Props) {
  const router = useRouter()
  const [exercises, setExercises] = useState<Exercise[]>(initialExercises)
  const [search, setSearch] = useState('')

  const filtered = search.trim()
    ? exercises.filter((e) => e.name.toLowerCase().includes(search.toLowerCase()))
    : exercises

  async function handleDelete(id: number, name: string) {
    if (!confirm(`¿Eliminar "${name}"? También se eliminará de todas las rutinas donde aparezca.`)) return
    await fetch(`/api/exercises/${id}`, { method: 'DELETE' })
    setExercises((prev) => prev.filter((e) => e.id !== id))
  }

  return (
    <div className="min-h-screen bg-black px-4 pb-8 pt-8">
      <div className="mb-6">
        <button
          onClick={() => router.push('/routines')}
          className="mb-1 text-xs font-semibold uppercase tracking-widest text-zinc-500"
        >
          ← Rutinas
        </button>
        <h1 className="text-4xl font-black text-white">Ejercicios</h1>
        <p className="mt-1 text-sm text-zinc-500">{exercises.length} ejercicios en total</p>
      </div>

      <input
        type="text"
        placeholder="Buscar..."
        value={search}
        onChange={(e) => setSearch(e.target.value)}
        className="mb-4 w-full rounded-xl bg-zinc-900 border border-zinc-800 px-4 py-3 text-white placeholder:text-zinc-600 focus:outline-none focus:ring-2 focus:ring-white"
      />

      <div className="flex flex-col gap-2">
        {filtered.map((ex) => (
          <div
            key={ex.id}
            className="flex items-center justify-between rounded-xl bg-zinc-900 border border-zinc-800 px-4 py-3"
          >
            <div>
              <p className="text-sm font-semibold text-white">{ex.name}</p>
              <p className="text-xs text-zinc-500">{ex.default_equipment}</p>
            </div>
            <button
              onClick={() => handleDelete(ex.id, ex.name)}
              className="ml-3 rounded-lg border border-red-900 bg-red-900/20 px-3 py-1.5 text-xs font-semibold text-red-400 active:scale-95 transition-transform"
            >
              Eliminar
            </button>
          </div>
        ))}

        {filtered.length === 0 && (
          <p className="text-center text-sm text-zinc-600 py-8">Sin resultados</p>
        )}
      </div>
    </div>
  )
}
