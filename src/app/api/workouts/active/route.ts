import { NextResponse } from 'next/server'
import { supabase } from '@/lib/supabase'

export async function GET() {
  const { data, error } = await supabase
    .from('workout_days')
    .select(`
      id, name, order,
      routine_exercises (
        id, exercise_id, target_sets, target_reps_range, base_weight, order,
        exercises ( name, default_equipment )
      )
    `)
    .order('order')

  if (error) return NextResponse.json({ error: error.message }, { status: 500 })

  const response = (data ?? []).map((day) => ({
    id: day.id,
    name: day.name,
    order: day.order,
    exercises: (day.routine_exercises as any[])
      .sort((a, b) => a.order - b.order)
      .map((re) => ({
        routineExerciseId: re.id,
        exerciseId: re.exercise_id,
        exerciseName: (re.exercises as any).name,
        equipment: (re.exercises as any).default_equipment,
        targetSets: re.target_sets,
        targetRepsRange: re.target_reps_range,
        baseWeight: re.base_weight,
        order: re.order,
      })),
  }))

  return NextResponse.json(response)
}
