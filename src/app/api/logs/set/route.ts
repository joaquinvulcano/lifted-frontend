import { NextRequest, NextResponse } from 'next/server'
import { supabase } from '@/lib/supabase'

export async function POST(req: NextRequest) {
  const { workoutLogId, exerciseId, setNumber, weight, repsPerformed, isCompleted } =
    await req.json() as {
      workoutLogId: number
      exerciseId: number
      setNumber: number
      weight: number
      repsPerformed: number
      isCompleted: boolean
    }

  const { data: existing } = await supabase
    .from('set_logs')
    .select('id')
    .eq('workout_log_id', workoutLogId)
    .eq('exercise_id', exerciseId)
    .eq('set_number', setNumber)
    .maybeSingle()

  if (existing) {
    const { error } = await supabase
      .from('set_logs')
      .update({ weight, reps_performed: repsPerformed, is_completed: isCompleted })
      .eq('id', existing.id)

    if (error) return NextResponse.json({ error: error.message }, { status: 500 })
    return NextResponse.json({ setLogId: existing.id, isCompleted })
  }

  const { data, error } = await supabase
    .from('set_logs')
    .insert({
      workout_log_id: workoutLogId,
      exercise_id: exerciseId,
      set_number: setNumber,
      weight,
      reps_performed: repsPerformed,
      is_completed: isCompleted,
    })
    .select('id')
    .single()

  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  return NextResponse.json({ setLogId: data.id, isCompleted }, { status: 201 })
}
