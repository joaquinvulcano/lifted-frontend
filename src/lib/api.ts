import type { WorkoutDay, ExerciseHistory, ActiveSession, SetLogEntry } from './types'

// En el navegador usa rutas relativas; en el servidor necesita URL absoluta
function getBaseUrl(): string {
  if (typeof window !== 'undefined') return ''
  return process.env.NEXT_PUBLIC_APP_URL ?? 'http://localhost:3000'
}

async function fetchJson<T>(path: string, init?: RequestInit): Promise<T> {
  const res = await fetch(`${getBaseUrl()}${path}`, {
    headers: { 'Content-Type': 'application/json' },
    ...init,
  })
  if (!res.ok) throw new Error(`API error ${res.status}: ${path}`)
  return res.json() as Promise<T>
}

export async function getActiveWorkout(): Promise<WorkoutDay[]> {
  return fetchJson<WorkoutDay[]>('/api/workouts/active')
}

export async function startSession(workoutDayId: number, notes?: string): Promise<ActiveSession> {
  const body = await fetchJson<{ workoutLogId: number; date: string }>(
    '/api/logs/start',
    { method: 'POST', body: JSON.stringify({ workoutDayId, notes: notes ?? null }) }
  )
  return { workoutLogId: body.workoutLogId, workoutDayId, date: body.date }
}

export async function saveSet(
  workoutLogId: number,
  exerciseId: number,
  entry: SetLogEntry
): Promise<void> {
  await fetchJson('/api/logs/set', {
    method: 'POST',
    body: JSON.stringify({
      workoutLogId,
      exerciseId,
      setNumber: entry.setNumber,
      weight: parseFloat(entry.weight) || 0,
      repsPerformed: parseInt(entry.repsPerformed) || 0,
      isCompleted: entry.isCompleted,
    }),
  })
}

export async function finishSession(workoutLogId: number): Promise<void> {
  await fetchJson('/api/logs/finish', {
    method: 'POST',
    body: JSON.stringify({ workoutLogId }),
  })
}

export async function getExerciseHistory(exerciseId: number): Promise<ExerciseHistory[]> {
  try {
    return await fetchJson<ExerciseHistory[]>(`/api/exercises/${exerciseId}/history`)
  } catch {
    return []
  }
}
