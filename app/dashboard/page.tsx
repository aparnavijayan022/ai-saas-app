import { auth } from '@/auth'
import { redirect } from 'next/navigation'
import UpgradeButton from './UpgradeButton'

export default async function DashboardPage() {
  const session = await auth()

  if (!session) {
    redirect('/login')
  }

  return (
    <div className="max-w-2xl mx-auto px-4 py-10">
      <h1 className="text-3xl font-bold text-gray-900 mb-2">Dashboard</h1>
      <p className="text-gray-600 mb-6">Welcome, {session.user?.email}</p>
      <UpgradeButton />
    </div>
  )
}