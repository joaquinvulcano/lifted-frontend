import { fetchActiveWorkout, fetchCompletedDaysThisWeek } from '@/lib/queries'
import { DashboardClient } from './DashboardClient'

export default async function DashboardPage() {
  const [days, completedDays] = await Promise.all([
    fetchActiveWorkout(),
    fetchCompletedDaysThisWeek(),
  ])
  return <DashboardClient days={days} completedDays={completedDays} />
}
