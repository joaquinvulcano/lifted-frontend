'use client'

import type { SetLogEntry, ExerciseHistory } from '@/lib/types'

interface Props {
  entry: SetLogEntry
  previousSet: ExerciseHistory | undefined
  onChange: (updated: Partial<SetLogEntry>) => void
  onComplete: () => void
  isSaving: boolean
}

export function SetRow({ entry, previousSet, onChange, onComplete, isSaving }: Props) {
  const prevLabel = previousSet
    ? `${previousSet.weight}kg × ${previousSet.repsPerformed}`
    : '—'

  return (
    <div
      className={`flex items-center gap-2 rounded-xl px-3 py-3 transition-colors ${
        entry.isCompleted ? 'bg-green-900/30 border border-green-700' : 'bg-zinc-800 border border-zinc-700'
      }`}
    >
      <span className="w-6 text-center text-sm font-bold text-zinc-400">
        {entry.setNumber}
      </span>

      <div className="flex flex-col items-center flex-1">
        <input
          type="number"
          inputMode="decimal"
          placeholder={previousSet ? String(previousSet.weight) : '0'}
          value={entry.weight}
          onChange={(e) => onChange({ weight: e.target.value })}
          disabled={entry.isCompleted}
          className="w-full rounded-lg bg-zinc-700 px-3 py-3 text-center text-xl font-bold text-white placeholder:text-zinc-500 focus:outline-none focus:ring-2 focus:ring-orange-500 disabled:opacity-60"
        />
        <span className="mt-1 text-xs text-zinc-500">kg</span>
      </div>

      <div className="flex flex-col items-center flex-1">
        <input
          type="number"
          inputMode="numeric"
          placeholder={previousSet ? String(previousSet.repsPerformed) : '0'}
          value={entry.repsPerformed}
          onChange={(e) => onChange({ repsPerformed: e.target.value })}
          disabled={entry.isCompleted}
          className="w-full rounded-lg bg-zinc-700 px-3 py-3 text-center text-xl font-bold text-white placeholder:text-zinc-500 focus:outline-none focus:ring-2 focus:ring-orange-500 disabled:opacity-60"
        />
        <span className="mt-1 text-xs text-zinc-500">reps</span>
      </div>

      <span className="w-20 text-right text-xs text-zinc-500 leading-tight">
        {prevLabel}
      </span>

      <button
        onClick={onComplete}
        disabled={isSaving}
        className={`ml-1 h-12 w-12 rounded-xl text-xl font-bold transition-all active:scale-90 ${
          entry.isCompleted
            ? 'bg-green-500 text-white'
            : 'bg-zinc-600 text-zinc-300 hover:bg-green-600 hover:text-white'
        }`}
      >
        {isSaving ? '…' : '✓'}
      </button>
    </div>
  )
}
