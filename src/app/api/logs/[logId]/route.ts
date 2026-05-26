import { NextResponse } from 'next/server'
import { supabase } from '@/lib/supabase'

interface Ctx { params: Promise<{ logId: string }> }

export async function DELETE(_req: Request, { params }: Ctx) {
  const { logId } = await params

  await supabase.from('set_logs').delete().eq('workout_log_id', logId)

  const { error } = await supabase.from('workout_logs').delete().eq('id', logId)
  if (error) return NextResponse.json({ error: error.message }, { status: 500 })

  return NextResponse.json({ ok: true })
}
