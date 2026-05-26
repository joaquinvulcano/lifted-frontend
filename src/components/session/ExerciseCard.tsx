'use client'

import { useState, useEffect } from 'react'
import type { RoutineExercise, SetLogEntry, ExerciseHistory } from '@/lib/types'
import { getExerciseHistory } from '@/lib/api'
import { SetRow } from './SetRow'

interface Props {
  exercise: RoutineExercise
  workoutLogId: number
  onSetComplete: (exerciseId: number, entry: SetLogEntry) => Promise<void>
}

function buildInitialSets(count: number, baseWeight: number | null): SetLogEntry[] {
  return Array.from({ length: count }, (_, i) => ({
    setNumber: i + 1,
    weight: baseWeight != null ? String(baseWeight) : '',
    repsPerformed: '',
    isCompleted: false,
  }))
}

export function ExerciseCard({ exercise, workoutLogId, onSetComplete }: Props) {
  const [sets, setSets] = useState<SetLogEntry[]>(() =>
    buildInitialSets(exercise.targetSets, exercise.baseWeight)
  )
  const [history, setHistory] = useState<ExerciseHistory[]>([])
  const [savingSet, setSavingSet] = useState<number | null>(null)

  useEffect(() => {
    getExerciseHistory(exercise.exerciseId).then(setHistory)
  }, [exercise.exerciseId])

  function getPreviousSet(setNumber: number): ExerciseHistory | undefined {
    return history.find((h) => h.setNumber === setNumber)
  }

  function updateSet(index: number, partial: Partial<SetLogEntry>) {
    setSets((prev) =>
      prev.map((s, i) => (i === index ? { ...s, ...partial } : s))
    )
  }

  async function handleComplete(index: number) {
    const entry = { ...sets[index], isCompleted: true }
    setSavingSet(index)
    updateSet(index, { isCompleted: true })
    try {
      await onSetComplete(exercise.exerciseId, entry)
    } catch {
      updateSet(index, { isCompleted: false })
    } finally {
      setSavingSet(null)
    }
  }

  const completedCount = sets.filter((s) => s.isCompleted).length
  const allDone = completedCount === sets.length

  return (
    <div className={`rounded-2xl p-4 ${allDone ? 'bg-zinc-900/60' : 'bg-zinc-900'} border border-zinc-800`}>
      <div className="mb-3 flex items-start justify-between gap-2">
        <div>
          <h3 className="text-lg font-bold text-white leading-tight">
            {exercise.exerciseName}
          </h3>
          <p className="text-sm text-zinc-500">
            {exercise.equipment} · {exercise.targetSets}×{exercise.targetRepsRange}
          </p>
        </div>
        <span className="shrink-0 rounded-full bg-zinc-700 px-2 py-1 text-xs font-semibold text-zinc-300">
          {completedCount}/{sets.length}
        </span>
      </div>

      <div className="space-y-2">
        {sets.map((entry, i) => (
          <SetRow
            key={entry.setNumber}
            entry={entry}
            previousSet={getPreviousSet(entry.setNumber)}
            onChange={(partial) => updateSet(i, partial)}
            onComplete={() => handleComplete(i)}
            isSaving={savingSet === i}
          />
        ))}
      </div>
    </div>
  )
}
