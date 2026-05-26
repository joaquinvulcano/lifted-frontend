import { NextResponse } from 'next/server'
import { supabase } from '@/lib/supabase'

interface Ctx { params: Promise<{ id: string }> }

export async function POST(_req: Request, { params }: Ctx) {
  const { id } = await params

  await supabase.from('routines').update({ is_active: false }).neq('id', id)

  const { error } = await supabase
    .from('routines')
    .update({ is_active: true })
    .eq('id', id)

  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  return NextResponse.json({ ok: true })
}
