import { NextResponse } from 'next/server'
import { supabase } from '@/lib/supabase'

interface Ctx { params: Promise<{ id: string; dayId: string }> }

export async function DELETE(_req: Request, { params }: Ctx) {
  const { dayId } = await params

  const { data: logs } = await supabase
    .from('workout_logs')
    .select('id')
    .eq('workout_day_id', dayId)

  const logIds = (logs ?? []).map((l: any) => l.id)
  if (logIds.length > 0) {
    await supabase.from('set_logs').delete().in('workout_log_id', logIds)
    await supabase.from('workout_logs').delete().in('id', logIds)
  }

  await supabase.from('routine_exercises').delete().eq('workout_day_id', dayId)

  const { error } = await supabase.from('workout_days').delete().eq('id', dayId)
  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  return NextResponse.json({ ok: true })
}
