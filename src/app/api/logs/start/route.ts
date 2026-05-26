import { NextRequest, NextResponse } from 'next/server'
import { supabase } from '@/lib/supabase'

export async function POST(req: NextRequest) {
  const { workoutDayId, notes } = await req.json() as {
    workoutDayId: number
    notes?: string | null
  }

  const { data, error } = await supabase
    .from('workout_logs')
    .insert({ workout_day_id: workoutDayId, notes: notes ?? null })
    .select('id, date')
    .single()

  if (error) return NextResponse.json({ error: error.message }, { status: 500 })

  return NextResponse.json({ workoutLogId: data.id, date: data.date }, { status: 201 })
}
