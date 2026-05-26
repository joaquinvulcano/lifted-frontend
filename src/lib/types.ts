export interface Routine {
  id: number
  name: string
  description: string | null
  isActive: boolean
  dayCount: number
}

export interface WorkoutDay {
  id: number
  name: string
  order: number
  exercises: RoutineExercise[]
}

export interface RoutineExercise {
  routineExerciseId: number
  exerciseId: number
  exerciseName: string
  equipment: string
  targetSets: number
  targetRepsRange: string
  baseWeight: number | null
  order: number
}

export interface ExerciseHistory {
  date: string
  setNumber: number
  weight: number
  repsPerformed: number
}

export interface SetLogEntry {
  setNumber: number
  weight: string
  repsPerformed: string
  isCompleted: boolean
  savedId?: number
}

export interface ActiveSession {
  workoutLogId: number
  workoutDayId: number
  date: string
}
