import { fetchActiveWorkout } from '@/lib/queries'
import { SessionPageClient } from './SessionPageClient'

interface Props {
  params: Promise<{ dayId: string }>
}

export default async function SessionPage({ params }: Props) {
  const { dayId } = await params
  const days = await fetchActiveWorkout()
  const day = days.find((d) => d.id === Number(dayId))

  if (!day) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-black text-white">
        <p>Día no encontrado.</p>
      </div>
    )
  }

  return <SessionPageClient day={day} />
}
