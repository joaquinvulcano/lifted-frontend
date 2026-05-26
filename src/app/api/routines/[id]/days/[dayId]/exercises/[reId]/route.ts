import { NextResponse } from 'next/server'
import { supabase } from '@/lib/supabase'

interface Ctx { params: Promise<{ id: string; dayId: string; reId: string }> }

export async function DELETE(_req: Request, { params }: Ctx) {
  const { reId } = await params

  const { error } = await supabase
    .from('routine_exercises')
    .delete()
    .eq('id', reId)

  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  return NextResponse.json({ ok: true })
}
