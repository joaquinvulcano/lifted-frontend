'use client'

import { useEffect, useState } from 'react'
import type { WorkoutDay, ActiveSession } from '@/lib/types'
import { SessionTracker } from '@/components/session/SessionTracker'

interface Props {
  day: WorkoutDay
}

export function SessionPageClient({ day }: Props) {
  const [session, setSession] = useState<ActiveSession | null>(null)

  useEffect(() => {
    const stored = sessionStorage.getItem(`session-${day.id}`)
    if (stored) {
      setSession(JSON.parse(stored) as ActiveSession)
    }
  }, [day.id])

  if (!session) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-black">
        <div className="h-10 w-10 animate-spin rounded-full border-4 border-zinc-600 border-t-white" />
      </div>
    )
  }

  return <SessionTracker day={day} session={session} />
}
