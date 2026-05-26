import { supabase } from '@/lib/supabase'
import type { WorkoutDay } from '@/lib/types'
import { RoutineDetailClient } from './RoutineDetailClient'
import { notFound } from 'next/navigation'

interface Props {
  params: Promise<{ id: string }>
}

async function fetchRoutine(id: string) {
  const { data } = await supabase
    .from('routines')
    .select('id, name, description, is_active')
    .eq('id', id)
    .single()
  return data
}

async function fetchDays(routineId: string): Promise<WorkoutDay[]> {
  const { data, error } = await supabase
    .from('workout_days')
    .select(`
      id, name, order,
      routine_exercises (
        id, exercise_id, target_sets, target_reps_range, base_weight, order,
        exercises ( name, default_equipment )
      )
    `)
    .eq('routine_id', routineId)
    .order('order')

  if (error) return []

  return (data ?? []).map((day: any) => ({
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

export default async function RoutineDetailPage({ params }: Props) {
  const { id } = await params
  const [routine, days] = await Promise.all([fetchRoutine(id), fetchDays(id)])

  if (!routine) notFound()

  return (
    <RoutineDetailClient
      routineId={routine.id}
      initialName={routine.name}
      initialDescription={routine.description}
      initialDays={days}
    />
  )
}
