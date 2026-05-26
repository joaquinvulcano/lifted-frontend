import { NextResponse } from 'next/server'
import { supabase } from '@/lib/supabase'

export async function POST(req: Request) {
  const { workoutLogId } = await req.json()

  if (!workoutLogId) {
    return NextResponse.json({ error: 'workoutLogId requerido' }, { status: 400 })
  }

  const { error } = await supabase
    .from('workout_logs')
    .update({ completed_at: new Date().toISOString() })
    .eq('id', workoutLogId)

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }

  return NextResponse.json({ ok: true })
}
