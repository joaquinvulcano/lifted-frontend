import { NextResponse } from 'next/server'
import { supabase } from '@/lib/supabase'

interface Ctx { params: Promise<{ id: string }> }

export async function PATCH(req: Request, { params }: Ctx) {
  const { id } = await params
  const { name, description } = await req.json()

  if (!name?.trim()) {
    return NextResponse.json({ error: 'Nombre requerido' }, { status: 400 })
  }

  const { error } = await supabase
    .from('routines')
    .update({ name: name.trim(), description: description?.trim() ?? null })
    .eq('id', id)

  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  return NextResponse.json({ ok: true })
}

export async function DELETE(_req: Request, { params }: Ctx) {
  const { id } = await params

  const { data: days } = await supabase
    .from('workout_days')
    .select('id')
    .eq('routine_id', id)

  const dayIds = (days ?? []).map((d: any) => d.id)

  if (dayIds.length > 0) {
    const { data: logs } = await supabase
      .from('workout_logs')
      .select('id')
      .in('workout_day_id', dayIds)

    const logIds = (logs ?? []).map((l: any) => l.id)
    if (logIds.length > 0) {
      await supabase.from('set_logs').delete().in('workout_log_id', logIds)
      await supabase.from('workout_logs').delete().in('id', logIds)
    }

    await supabase.from('routine_exercises').delete().in('workout_day_id', dayIds)
    await supabase.from('workout_days').delete().in('id', dayIds)
  }

  const { error } = await supabase.from('routines').delete().eq('id', id)
  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  return NextResponse.json({ ok: true })
}
