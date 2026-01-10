'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';

const TITLE_MAP = {
  '/': 'Home',
  '/home': 'Home',
  '/about': 'About',
  '/why-donor-connect': 'Why DonorConnect?',
  '/dashboard': 'Dashboard',
  '/settings': 'Settings',
  '/ai-policy': 'AI Policy & Safeguards',
  '/rubric-evidence': 'Rubric Evidence',
  '/reflection': 'Reflection',
  '/donors': 'Donors',
  '/donors/new': 'Add Donor',
  '/donations': 'Donations',
  '/donations/new': 'Record Donation',
  '/register': 'Sign Up',
  '/login': 'Login',
}

function formatTitle(pathname) {
  if (!pathname) return 'Dashboard'
  return TITLE_MAP[pathname] || 'Dashboard'
}

export default function Topbar() {
  const pathname = usePathname();
  const title = formatTitle(pathname);

  return (
    <header className="bg-gray-800 text-white p-4 flex justify-between items-center">
      <div className="w-1/3"></div>
      <div className="w-1/3 text-center">
        <h1 className="text-xl font-bold">{title}</h1>
      </div>
      <div className="w-1/3 flex justify-end space-x-4">
        <Link href="/register" className="text-sm font-medium rounded-md hover:bg-gray-700 px-3 py-2">
          Sign Up
        </Link>
        <Link href="/login" className="text-sm font-medium rounded-md hover:bg-gray-700 px-3 py-2">
          Login
        </Link>
      </div>
    </header>
  );
}
