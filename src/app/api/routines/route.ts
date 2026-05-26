import { NextResponse } from 'next/server'
import { supabase } from '@/lib/supabase'

export async function GET() {
  const { data, error } = await supabase
    .from('routines')
    .select('id, name, description, is_active, workout_days(id)')
    .order('created_at')

  if (error) return NextResponse.json({ error: error.message }, { status: 500 })

  const routines = (data ?? []).map((r: any) => ({
    id: r.id,
    name: r.name,
    description: r.description,
    isActive: r.is_active,
    dayCount: r.workout_days?.length ?? 0,
  }))

  return NextResponse.json(routines)
}

export async function POST(req: Request) {
  const { name, description } = await req.json()
  if (!name?.trim()) {
    return NextResponse.json({ error: 'Nombre requerido' }, { status: 400 })
  }

  const { data, error } = await supabase
    .from('routines')
    .insert({ name: name.trim(), description: description?.trim() ?? null, is_active: false })
    .select('id, name, description, is_active')
    .single()

  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  return NextResponse.json({ ...data, isActive: data.is_active, dayCount: 0 }, { status: 201 })
}
