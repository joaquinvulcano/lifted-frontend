import { NextResponse } from 'next/server'
import { supabase } from '@/lib/supabase'

interface Ctx { params: Promise<{ id: string }> }

export async function DELETE(_req: Request, { params }: Ctx) {
  const { id } = await params

  await supabase.from('set_logs').delete().eq('exercise_id', id)
  await supabase.from('routine_exercises').delete().eq('exercise_id', id)

  const { error } = await supabase.from('exercises').delete().eq('id', id)
  if (error) return NextResponse.json({ error: error.message }, { status: 500 })

  return NextResponse.json({ ok: true })
}
