// Home page - Redirects to dashboard or login
import { getSessionUser } from '@/lib/session'
import { redirect } from 'next/navigation'

export default async function HomePage() {
  const user = await getSessionUser();

  if (user) {
    redirect('/dashboard');
  } else {
    redirect('/home');
  }
}
