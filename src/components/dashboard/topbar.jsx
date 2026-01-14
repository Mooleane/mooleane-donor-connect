"use client";

import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { useState, useEffect } from 'react';

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
  const router = useRouter();
  const [user, setUser] = useState(null);
  const [checking, setChecking] = useState(true);
  const [loggingOut, setLoggingOut] = useState(false);

  useEffect(() => {
    let mounted = true;
    async function fetchSession() {
      setChecking(true);
      try {
        const res = await fetch('/api/auth/session');
        if (!res.ok) {
          if (mounted) setUser(null);
        } else {
          const data = await res.json();
          if (mounted) setUser(data.user || null);
        }
      } catch (e) {
        if (mounted) setUser(null);
      }
      if (mounted) setChecking(false);
    }
    fetchSession();
    return () => { mounted = false };
  }, []);

  return (
    <header className="bg-gray-800 text-white p-4 flex justify-between items-center">
      <div className="w-1/3"></div>
      <div className="w-1/3 text-center">
        <h1 className="text-xl font-bold">{title}</h1>
      </div>
      <div className="w-1/3 flex justify-end space-x-4">
        {checking ? null : user ? (
          <>
            <div className="text-sm text-gray-200 py-2">{user.email || user.name}</div>
            <button
              className="text-sm font-medium rounded-md hover:bg-gray-700 px-3 py-2 bg-red-600"
              onClick={async () => {
                if (loggingOut) return;
                setLoggingOut(true);
                try {
                  const res = await fetch('/api/auth/logout', { method: 'POST' });
                  if (res.ok) {
                    router.push('/login');
                  } else {
                    const data = await res.json();
                    alert(data?.error || 'Failed to sign out');
                    setLoggingOut(false);
                  }
                } catch (e) {
                  alert(e.message || 'Failed to sign out');
                  setLoggingOut(false);
                }
              }}
              disabled={loggingOut}
            >
              {loggingOut ? 'Signing out…' : 'Sign Out'}
            </button>
          </>
        ) : (
          <>
            <Link href="/register" className="text-sm font-medium rounded-md hover:bg-gray-700 px-3 py-2">
              Sign Up
            </Link>
            <Link href="/login" className="text-sm font-medium rounded-md hover:bg-gray-700 px-3 py-2">
              Login
            </Link>
          </>
        )}
      </div>
    </header>
  );
}
