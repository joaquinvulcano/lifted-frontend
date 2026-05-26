import { NextRequest, NextResponse } from 'next/server'
import { supabase } from '@/lib/supabase'

export async function GET(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params

  const { data, error } = await supabase
    .from('set_logs')
    .select('set_number, weight, reps_performed, workout_logs(date)')
    .eq('exercise_id', Number(id))
    .eq('is_completed', true)
    .order('workout_log_id', { ascending: false })
    .limit(20)

  if (error) return NextResponse.json({ error: error.message }, { status: 500 })

  const response = (data ?? []).map((s) => ({
    date: (s.workout_logs as any).date,
    setNumber: s.set_number,
    weight: s.weight,
    repsPerformed: s.reps_performed,
  }))

  return NextResponse.json(response)
}
