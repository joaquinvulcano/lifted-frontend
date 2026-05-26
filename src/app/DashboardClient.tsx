'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import type { WorkoutDay } from '@/lib/types'
import type { CompletedDay } from '@/lib/queries'
import { startSession } from '@/lib/api'
import { DayCard } from '@/components/dashboard/DayCard'

interface Props {
  days: WorkoutDay[]
  completedDays: CompletedDay[]
}

export function DashboardClient({ days, completedDays: initialCompleted }: Props) {
  const router = useRouter()
  const [completedDays, setCompletedDays] = useState<CompletedDay[]>(initialCompleted)

  async function handleStart(dayId: number) {
    const session = await startSession(dayId)
    sessionStorage.setItem(`session-${dayId}`, JSON.stringify(session))
    router.push(`/session/${dayId}`)
  }

  async function handleUndo(logId: number) {
    await fetch(`/api/logs/${logId}`, { method: 'DELETE' })
    setCompletedDays((prev) => prev.filter((c) => c.logId !== logId))
  }

  const completedCount = completedDays.length
  const totalDays = days.length

  return (
    <div className="min-h-screen bg-black px-4 pb-8 pt-8">
      <div className="mb-6 flex items-start justify-between">
        <div>
          <p className="text-xs font-semibold uppercase tracking-widest text-zinc-500">
            Hoy es un buen día para
          </p>
          <h1 className="text-4xl font-black text-white">Levantar</h1>
          {completedCount > 0 && (
            <p className="mt-1 text-sm text-zinc-400">
              {completedCount}/{totalDays} días completados esta semana
            </p>
          )}
        </div>
        <button
          onClick={() => router.push('/routines')}
          className="mt-1 rounded-xl border border-zinc-700 px-3 py-2 text-xs font-semibold text-zinc-400 active:scale-95 transition-transform"
        >
          Rutinas
        </button>
      </div>

      <div className="flex flex-col gap-4">
        {days.map((day) => {
          const completed = completedDays.find((c) => c.dayId === day.id)
          return (
            <DayCard
              key={day.id}
              day={day}
              isCompleted={!!completed}
              completedLogId={completed?.logId}
              onStart={handleStart}
              onUndo={handleUndo}
            />
          )
        })}
      </div>
    </div>
  )
}
