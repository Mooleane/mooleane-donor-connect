// Dashboard layout - Protected area
import { redirect } from 'next/navigation'
import { getSessionUser } from '@/lib/session'

export default async function DashboardLayout({ children }) {
  const user = await getSessionUser()

  if (!user) {
    redirect('/login')
  }

  return (
    <>
      {children}
    </>
  )
}