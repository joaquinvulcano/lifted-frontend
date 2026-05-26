import { NextResponse } from 'next/server'
import { supabase } from '@/lib/supabase'

interface Ctx { params: Promise<{ id: string; dayId: string }> }

export async function POST(req: Request, { params }: Ctx) {
  const { dayId } = await params
  const { exerciseId, targetSets, targetRepsRange, baseWeight } = await req.json()

  if (!exerciseId || !targetSets || !targetRepsRange) {
    return NextResponse.json({ error: 'exerciseId, targetSets y targetRepsRange requeridos' }, { status: 400 })
  }

  const { data: existing } = await supabase
    .from('routine_exercises')
    .select('order')
    .eq('workout_day_id', dayId)
    .order('order', { ascending: false })
    .limit(1)

  const nextOrder = ((existing?.[0] as any)?.order ?? 0) + 1

  const { data, error } = await supabase
    .from('routine_exercises')
    .insert({
      workout_day_id: Number(dayId),
      exercise_id: exerciseId,
      target_sets: targetSets,
      target_reps_range: targetRepsRange,
      base_weight: baseWeight ? Number(baseWeight) : null,
      order: nextOrder,
    })
    .select('id, exercise_id, target_sets, target_reps_range, base_weight, order, exercises(name, default_equipment)')
    .single()

  if (error) return NextResponse.json({ error: error.message }, { status: 500 })

  return NextResponse.json({
    routineExerciseId: data.id,
    exerciseId: data.exercise_id,
    exerciseName: (data.exercises as any)?.name ?? '',
    equipment: (data.exercises as any)?.default_equipment ?? '',
    targetSets: data.target_sets,
    targetRepsRange: data.target_reps_range,
    baseWeight: data.base_weight,
    order: data.order,
  }, { status: 201 })
}
