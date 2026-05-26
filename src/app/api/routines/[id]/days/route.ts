import { NextResponse } from 'next/server'
import { supabase } from '@/lib/supabase'

interface Ctx { params: Promise<{ id: string }> }

export async function GET(_req: Request, { params }: Ctx) {
  const { id } = await params

  const { data, error } = await supabase
    .from('workout_days')
    .select(`
      id, name, order,
      routine_exercises (
        id, exercise_id, target_sets, target_reps_range, base_weight, order,
        exercises ( name, default_equipment )
      )
    `)
    .eq('routine_id', id)
    .order('order')

  if (error) return NextResponse.json({ error: error.message }, { status: 500 })

  const days = (data ?? []).map((day: any) => ({
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

  return NextResponse.json(days)
}

export async function POST(req: Request, { params }: Ctx) {
  const { id } = await params
  const { name } = await req.json()

  if (!name?.trim()) {
    return NextResponse.json({ error: 'Nombre requerido' }, { status: 400 })
  }

  const { data: existing } = await supabase
    .from('workout_days')
    .select('order')
    .eq('routine_id', id)
    .order('order', { ascending: false })
    .limit(1)

  const nextOrder = ((existing?.[0] as any)?.order ?? 0) + 1

  const { data, error } = await supabase
    .from('workout_days')
    .insert({ routine_id: Number(id), name: name.trim(), order: nextOrder })
    .select('id, name, order')
    .single()

  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  return NextResponse.json({ ...data, exercises: [] }, { status: 201 })
}
