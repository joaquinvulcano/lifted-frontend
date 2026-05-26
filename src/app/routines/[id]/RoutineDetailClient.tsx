'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import type { WorkoutDay, RoutineExercise } from '@/lib/types'
import { ExerciseCombobox } from '@/components/ExerciseCombobox'

interface Exercise {
  id: number
  name: string
  default_equipment: string
}

interface Props {
  routineId: number
  initialName: string
  initialDescription: string | null
  initialDays: WorkoutDay[]
}

export function RoutineDetailClient({ routineId, initialName, initialDescription, initialDays }: Props) {
  const router = useRouter()
  const [name, setName] = useState(initialName)
  const [editingName, setEditingName] = useState(false)
  const [days, setDays] = useState<WorkoutDay[]>(initialDays)
  const [allExercises, setAllExercises] = useState<Exercise[]>([])
  const [newDayName, setNewDayName] = useState('')
  const [addingDay, setAddingDay] = useState(false)
  const [showAddDay, setShowAddDay] = useState(false)
  const [addExerciseForDay, setAddExerciseForDay] = useState<number | null>(null)
  const [exForm, setExForm] = useState({ exerciseId: '', targetSets: '3', targetRepsRange: '8-10', baseWeight: '' })
  const [savingEx, setSavingEx] = useState(false)

  useEffect(() => {
    fetch('/api/exercises')
      .then((r) => r.json())
      .then(setAllExercises)
  }, [])

  async function saveName() {
    if (!name.trim()) return
    await fetch(`/api/routines/${routineId}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ name, description: initialDescription }),
    })
    setEditingName(false)
  }

  async function handleAddDay() {
    if (!newDayName.trim()) return
    setAddingDay(true)
    const res = await fetch(`/api/routines/${routineId}/days`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ name: newDayName }),
    })
    if (res.ok) {
      const day = await res.json()
      setDays((prev) => [...prev, day])
      setNewDayName('')
      setShowAddDay(false)
    }
    setAddingDay(false)
  }

  async function handleDeleteDay(dayId: number) {
    if (!confirm('¿Eliminar este día y todos sus ejercicios?')) return
    await fetch(`/api/routines/${routineId}/days/${dayId}`, { method: 'DELETE' })
    setDays((prev) => prev.filter((d) => d.id !== dayId))
  }

  async function handleCreateExercise(name: string, equipment: string): Promise<number> {
    const res = await fetch('/api/exercises', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ name, defaultEquipment: equipment }),
    })
    const created = await res.json()
    setAllExercises((prev) => [...prev, created].sort((a, b) => a.name.localeCompare(b.name)))
    return created.id
  }

  async function handleAddExercise(dayId: number) {
    if (!exForm.exerciseId || !exForm.targetSets || !exForm.targetRepsRange) return
    setSavingEx(true)
    const res = await fetch(`/api/routines/${routineId}/days/${dayId}/exercises`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        exerciseId: Number(exForm.exerciseId),
        targetSets: Number(exForm.targetSets),
        targetRepsRange: exForm.targetRepsRange,
        baseWeight: exForm.baseWeight || null,
      }),
    })
    if (res.ok) {
      const newEx: RoutineExercise = await res.json()
      setDays((prev) =>
        prev.map((d) =>
          d.id === dayId ? { ...d, exercises: [...d.exercises, newEx] } : d
        )
      )
      setExForm({ exerciseId: '', targetSets: '3', targetRepsRange: '8-10', baseWeight: '' })
      setAddExerciseForDay(null)
    }
    setSavingEx(false)
  }

  async function handleRemoveExercise(dayId: number, reId: number) {
    await fetch(`/api/routines/${routineId}/days/${dayId}/exercises/${reId}`, { method: 'DELETE' })
    setDays((prev) =>
      prev.map((d) =>
        d.id === dayId
          ? { ...d, exercises: d.exercises.filter((e) => e.routineExerciseId !== reId) }
          : d
      )
    )
  }

  return (
    <div className="min-h-screen bg-black px-4 pb-32 pt-8">
      <div className="mb-6">
        <button
          onClick={() => router.push('/routines')}
          className="mb-1 text-xs font-semibold uppercase tracking-widest text-zinc-500"
        >
          ← Rutinas
        </button>

        {editingName ? (
          <div className="flex gap-2 mt-1">
            <input
              autoFocus
              value={name}
              onChange={(e) => setName(e.target.value)}
              onBlur={saveName}
              onKeyDown={(e) => e.key === 'Enter' && saveName()}
              className="flex-1 rounded-xl bg-zinc-800 px-3 py-2 text-2xl font-black text-white focus:outline-none focus:ring-2 focus:ring-white"
            />
          </div>
        ) : (
          <button onClick={() => setEditingName(true)} className="text-left">
            <h1 className="text-4xl font-black text-white">{name}</h1>
            <p className="text-xs text-zinc-500 mt-0.5">Toca el nombre para editar</p>
          </button>
        )}
      </div>

      <div className="flex flex-col gap-4">
        {days.map((day) => (
          <div key={day.id} className="rounded-2xl border border-zinc-800 bg-zinc-900 p-4">
            <div className="mb-3 flex items-center justify-between">
              <h2 className="text-lg font-bold text-white">{day.name}</h2>
              <button
                onClick={() => handleDeleteDay(day.id)}
                className="text-xs text-red-400 px-2 py-1 rounded-lg bg-red-900/20 border border-red-900"
              >
                Eliminar día
              </button>
            </div>

            <div className="space-y-2 mb-3">
              {day.exercises.map((ex) => (
                <div
                  key={ex.routineExerciseId}
                  className="flex items-center justify-between rounded-xl bg-zinc-800 px-3 py-2"
                >
                  <div>
                    <p className="text-sm font-semibold text-white">{ex.exerciseName}</p>
                    <p className="text-xs text-zinc-500">
                      {ex.equipment} · {ex.targetSets}×{ex.targetRepsRange}
                      {ex.baseWeight ? ` · ${ex.baseWeight}kg` : ''}
                    </p>
                  </div>
                  <button
                    onClick={() => handleRemoveExercise(day.id, ex.routineExerciseId)}
                    className="ml-2 text-zinc-500 hover:text-red-400 text-xl leading-none px-1"
                  >
                    ×
                  </button>
                </div>
              ))}
              {day.exercises.length === 0 && (
                <p className="text-sm text-zinc-600">Sin ejercicios todavía</p>
              )}
            </div>

            {addExerciseForDay === day.id ? (
              <div className="flex flex-col gap-2 rounded-xl bg-zinc-800 p-3">
                <ExerciseCombobox
                  exercises={allExercises}
                  selectedId={exForm.exerciseId ? Number(exForm.exerciseId) : null}
                  onSelect={(id) => setExForm((f) => ({ ...f, exerciseId: id ? String(id) : '' }))}
                  onCreateNew={handleCreateExercise}
                />
                <div className="flex gap-2">
                  <div className="flex flex-col gap-1 flex-1">
                    <label className="text-xs text-zinc-400">Series</label>
                    <input
                      type="number"
                      value={exForm.targetSets}
                      onChange={(e) => setExForm((f) => ({ ...f, targetSets: e.target.value }))}
                      className="w-full rounded-lg bg-zinc-700 px-3 py-2 text-sm text-white focus:outline-none"
                    />
                  </div>
                  <div className="flex flex-col gap-1 flex-1">
                    <label className="text-xs text-zinc-400">Reps</label>
                    <input
                      type="text"
                      placeholder="8-10"
                      value={exForm.targetRepsRange}
                      onChange={(e) => setExForm((f) => ({ ...f, targetRepsRange: e.target.value }))}
                      className="w-full rounded-lg bg-zinc-700 px-3 py-2 text-sm text-white focus:outline-none"
                    />
                  </div>
                  <div className="flex flex-col gap-1 flex-1">
                    <label className="text-xs text-zinc-400">Peso (kg)</label>
                    <input
                      type="number"
                      placeholder="0"
                      value={exForm.baseWeight}
                      onChange={(e) => setExForm((f) => ({ ...f, baseWeight: e.target.value }))}
                      className="w-full rounded-lg bg-zinc-700 px-3 py-2 text-sm text-white focus:outline-none"
                    />
                  </div>
                </div>
                <div className="flex gap-2">
                  <button
                    onClick={() => handleAddExercise(day.id)}
                    disabled={savingEx || !exForm.exerciseId}
                    className="flex-1 rounded-xl bg-white py-2 text-sm font-bold text-black disabled:opacity-50"
                  >
                    {savingEx ? 'Guardando...' : 'Agregar'}
                  </button>
                  <button
                    onClick={() => setAddExerciseForDay(null)}
                    className="rounded-xl bg-zinc-700 px-4 py-2 text-sm text-zinc-300"
                  >
                    Cancelar
                  </button>
                </div>
              </div>
            ) : (
              <button
                onClick={() => setAddExerciseForDay(day.id)}
                className="w-full rounded-xl border border-zinc-700 py-2 text-sm font-semibold text-zinc-400 active:scale-95 transition-transform"
              >
                + Agregar ejercicio
              </button>
            )}
          </div>
        ))}
      </div>

      <div className="fixed bottom-0 left-0 right-0 border-t border-zinc-800 bg-black/95 p-4 backdrop-blur">
        {showAddDay ? (
          <div className="flex gap-2">
            <input
              autoFocus
              type="text"
              placeholder="Ej: PUSH, PIERNAS, LUNES..."
              value={newDayName}
              onChange={(e) => setNewDayName(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && handleAddDay()}
              className="flex-1 rounded-xl bg-zinc-800 px-4 py-3 text-white placeholder:text-zinc-500 focus:outline-none focus:ring-2 focus:ring-white"
            />
            <button
              onClick={handleAddDay}
              disabled={addingDay || !newDayName.trim()}
              className="rounded-xl bg-white px-4 py-3 font-bold text-black disabled:opacity-50"
            >
              {addingDay ? '...' : 'OK'}
            </button>
            <button
              onClick={() => setShowAddDay(false)}
              className="rounded-xl bg-zinc-800 px-3 py-3 text-zinc-400"
            >
              ✕
            </button>
          </div>
        ) : (
          <button
            onClick={() => setShowAddDay(true)}
            className="w-full rounded-2xl bg-white py-5 text-xl font-black text-black active:scale-95 transition-transform"
          >
            + Agregar día
          </button>
        )}
      </div>
    </div>
  )
}
