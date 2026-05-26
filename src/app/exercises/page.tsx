import { supabase } from '@/lib/supabase'
import { ExercisesClient } from './ExercisesClient'

async function fetchExercises() {
  const { data } = await supabase
    .from('exercises')
    .select('id, name, default_equipment')
    .order('name')
  return data ?? []
}

export default async function ExercisesPage() {
  const exercises = await fetchExercises()
  return <ExercisesClient initialExercises={exercises} />
}
