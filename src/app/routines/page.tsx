import { supabase } from '@/lib/supabase'
import type { Routine } from '@/lib/types'
import { RoutinesClient } from './RoutinesClient'

async function fetchRoutines(): Promise<Routine[]> {
  const { data, error } = await supabase
    .from('routines')
    .select('id, name, description, is_active, workout_days(id)')
    .order('created_at')

  if (error) return []

  return (data ?? []).map((r: any) => ({
    id: r.id,
    name: r.name,
    description: r.description,
    isActive: r.is_active,
    dayCount: r.workout_days?.length ?? 0,
  }))
}

export default async function RoutinesPage() {
  const routines = await fetchRoutines()
  return <RoutinesClient initialRoutines={routines} />
}
