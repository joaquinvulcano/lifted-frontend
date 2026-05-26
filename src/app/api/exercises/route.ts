import { NextResponse } from 'next/server'
import { supabase } from '@/lib/supabase'

export async function GET() {
  const { data, error } = await supabase
    .from('exercises')
    .select('id, name, default_equipment')
    .order('name')

  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  return NextResponse.json(data)
}

export async function POST(req: Request) {
  const { name, defaultEquipment } = await req.json()

  if (!name?.trim() || !defaultEquipment) {
    return NextResponse.json({ error: 'name y defaultEquipment requeridos' }, { status: 400 })
  }

  const { data, error } = await supabase
    .from('exercises')
    .insert({ name: name.trim(), default_equipment: defaultEquipment })
    .select('id, name, default_equipment')
    .single()

  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  return NextResponse.json(data, { status: 201 })
}
