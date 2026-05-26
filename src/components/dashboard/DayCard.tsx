'use client'

import type { WorkoutDay } from '@/lib/types'

const DAY_COLORS: Record<string, string> = {
  PUSH: 'border-orange-500 bg-orange-500/10',
  PULL: 'border-blue-500 bg-blue-500/10',
  LEG: 'border-green-500 bg-green-500/10',
  UPPER: 'border-purple-500 bg-purple-500/10',
  LOWER: 'border-red-500 bg-red-500/10',
}

interface Props {
  day: WorkoutDay
  isCompleted: boolean
  completedLogId?: number
  onStart: (dayId: number) => void
  onUndo?: (logId: number) => void
}

export function DayCard({ day, isCompleted, completedLogId, onStart, onUndo }: Props) {
  const colorClass = isCompleted
    ? 'border-zinc-700 bg-zinc-900/40'
    : DAY_COLORS[day.name] ?? 'border-zinc-600 bg-zinc-800/50'

  return (
    <div className={`rounded-2xl border-2 p-5 ${colorClass} flex flex-col gap-3 transition-all`}>
      <div className="flex items-center justify-between">
        <div>
          <span className="text-xs font-semibold uppercase tracking-widest text-zinc-500">
            Día {day.order}
          </span>
          <h2 className={`text-2xl font-bold ${isCompleted ? 'text-zinc-400' : 'text-white'}`}>
            {day.name}
          </h2>
        </div>
        {isCompleted ? (
          <div className="flex items-center gap-2">
            <span className="flex items-center gap-1.5 rounded-full bg-green-900/50 border border-green-700 px-3 py-1 text-sm font-semibold text-green-400">
              ✓ Hecho
            </span>
            {completedLogId && onUndo && (
              <button
                onClick={() => onUndo(completedLogId)}
                className="rounded-full border border-zinc-700 px-2 py-1 text-xs text-zinc-500 active:scale-95 transition-transform"
              >
                Deshacer
              </button>
            )}
          </div>
        ) : (
          <span className="rounded-full bg-zinc-700 px-3 py-1 text-sm text-zinc-300">
            {day.exercises.length} ejercicios
          </span>
        )}
      </div>

      <ul className="space-y-1">
        {day.exercises.slice(0, 4).map((ex) => (
          <li key={ex.routineExerciseId} className="text-sm text-zinc-500 truncate">
            · {ex.exerciseName}{' '}
            <span className="text-zinc-600">
              {ex.targetSets}×{ex.targetRepsRange}
            </span>
          </li>
        ))}
        {day.exercises.length > 4 && (
          <li className="text-sm text-zinc-600">
            + {day.exercises.length - 4} más...
          </li>
        )}
      </ul>

      <button
        onClick={() => onStart(day.id)}
        className={`mt-2 w-full rounded-xl py-4 text-lg font-bold active:scale-95 transition-transform ${
          isCompleted
            ? 'bg-zinc-700 text-zinc-300'
            : 'bg-white text-black'
        }`}
      >
        {isCompleted ? `Repetir ${day.name}` : `Iniciar ${day.name}`}
      </button>
    </div>
  )
}
