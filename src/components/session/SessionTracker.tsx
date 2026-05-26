'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import type { WorkoutDay, ActiveSession, SetLogEntry } from '@/lib/types'
import { saveSet, finishSession } from '@/lib/api'
import { ExerciseCard } from './ExerciseCard'

interface Props {
  day: WorkoutDay
  session: ActiveSession
}

export function SessionTracker({ day, session }: Props) {
  const router = useRouter()
  const [finishing, setFinishing] = useState(false)
  const [done, setDone] = useState(false)

  async function handleSetComplete(exerciseId: number, entry: SetLogEntry) {
    await saveSet(session.workoutLogId, exerciseId, entry)
  }

  async function handleFinish() {
    setFinishing(true)
    try {
      await finishSession(session.workoutLogId)
      setDone(true)
      setTimeout(() => router.push('/'), 2000)
    } catch {
      setFinishing(false)
    }
  }

  if (done) {
    return (
      <div className="flex min-h-screen flex-col items-center justify-center gap-6 bg-black px-6 text-center">
        <div className="text-7xl">💪</div>
        <div>
          <h1 className="text-4xl font-black text-white">¡Sesión completada!</h1>
          <p className="mt-2 text-zinc-400">{day.name} · {day.exercises.length} ejercicios</p>
        </div>
        <p className="text-sm text-zinc-600">Volviendo al inicio...</p>
      </div>
    )
  }

  return (
    <div className="flex min-h-screen flex-col bg-black pb-32">
      <header className="sticky top-0 z-10 border-b border-zinc-800 bg-black/95 px-4 py-4 backdrop-blur">
        <p className="text-xs font-semibold uppercase tracking-widest text-zinc-500">
          Sesión activa
        </p>
        <h1 className="text-3xl font-black text-white">{day.name}</h1>
        <p className="text-sm text-zinc-400">
          {new Date(session.date).toLocaleDateString('es-AR', {
            weekday: 'long',
            day: 'numeric',
            month: 'long',
          })}
        </p>
      </header>

      <main className="flex flex-col gap-4 px-4 pt-4">
        {day.exercises.map((exercise) => (
          <ExerciseCard
            key={exercise.routineExerciseId}
            exercise={exercise}
            workoutLogId={session.workoutLogId}
            onSetComplete={handleSetComplete}
          />
        ))}
      </main>

      <div className="fixed bottom-0 left-0 right-0 border-t border-zinc-800 bg-black/95 p-4 backdrop-blur">
        <button
          onClick={handleFinish}
          disabled={finishing}
          className="w-full rounded-2xl bg-white py-5 text-xl font-black text-black active:scale-95 transition-transform disabled:opacity-60"
        >
          {finishing ? 'Guardando...' : 'Finalizar Entrenamiento'}
        </button>
      </div>
    </div>
  )
}
