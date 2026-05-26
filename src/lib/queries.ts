import { supabase } from './supabase'
import type { WorkoutDay } from './types'

function weekBounds(): { start: string; end: string } {
  const now = new Date()
  const day = now.getDay() === 0 ? 6 : now.getDay() - 1 // Monday = 0
  const monday = new Date(now)
  monday.setDate(now.getDate() - day)
  monday.setHours(0, 0, 0, 0)
  const sunday = new Date(monday)
  sunday.setDate(monday.getDate() + 6)
  sunday.setHours(23, 59, 59, 999)
  return { start: monday.toISOString(), end: sunday.toISOString() }
}

export interface CompletedDay {
  dayId: number
  logId: number
}

export async function fetchCompletedDaysThisWeek(): Promise<CompletedDay[]> {
  const { start, end } = weekBounds()
  const { data, error } = await supabase
    .from('workout_logs')
    .select('id, workout_day_id')
    .not('completed_at', 'is', null)
    .gte('completed_at', start)
    .lte('completed_at', end)

  if (error) return []
  return (data ?? []).map((row: any) => ({ dayId: row.workout_day_id, logId: row.id }))
}

export async function fetchActiveWorkout(): Promise<WorkoutDay[]> {
  const { data: routine } = await supabase
    .from('routines')
    .select('id')
    .eq('is_active', true)
    .single()

  if (!routine) return []

  const { data, error } = await supabase
    .from('workout_days')
    .select(`
      id, name, order,
      routine_exercises (
        id, exercise_id, target_sets, target_reps_range, base_weight, order,
        exercises ( name, default_equipment )
      )
    `)
    .eq('routine_id', routine.id)
    .order('order')

  if (error) throw new Error(error.message)

  return (data ?? []).map((day) => ({
    id: day.id,
    name: day.name,
    order: day.order,
    exercises: (day.routine_exercises ?? [])
      .sort((a: any, b: any) => a.order - b.order)
      .map((re: any) => ({
        routineExerciseId: re.id,
        exerciseId: re.exercise_id,
        exerciseName: re.exercises?.name ?? '',
        equipment: re.exercises?.default_equipment ?? '',
        targetSets: re.target_sets,
        targetRepsRange: re.target_reps_range,
        baseWeight: re.base_weight,
        order: re.order,
      })),
  }))
}
