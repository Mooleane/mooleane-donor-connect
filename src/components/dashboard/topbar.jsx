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
      if (mounted) setChecking(true);
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
      if (mounted) {
        setChecking(false);
        setLoggingOut(false);
      }
    }

    // Initial fetch
    fetchSession();

    // Handler to refresh session on auth events
    const refreshHandler = () => {
      fetchSession();
    };

    // Listen for custom window events (same-tab) and storage events (cross-tab)
    window.addEventListener('auth:login', refreshHandler);
    window.addEventListener('auth:logout', refreshHandler);

    const storageHandler = (e) => {
      if (e.key === 'donorconnect:auth') {
        fetchSession();
      }
    };
    window.addEventListener('storage', storageHandler);

    return () => {
      mounted = false;
      window.removeEventListener('auth:login', refreshHandler);
      window.removeEventListener('auth:logout', refreshHandler);
      window.removeEventListener('storage', storageHandler);
    };
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
            <div className="text-sm text-gray-200 py-2">
              {user.email || user.name} <span className="text-xs text-gray-300">({user.isPro ? 'pro tier' : 'free tier'})</span>
            </div>
            <button
              className="text-sm font-medium rounded-md hover:bg-gray-700 px-3 py-2 bg-red-600"
              onClick={async () => {
                if (loggingOut) return;
                setLoggingOut(true);
                try {
                  const res = await fetch('/api/auth/logout', { method: 'POST' });
                  if (res.ok) {
                    // signal other tabs and listeners that auth changed
                    try { localStorage.setItem('donorconnect:auth', String(Date.now())); } catch (e) { }
                    window.dispatchEvent(new CustomEvent('auth:logout'));
                    setUser(null);
                    setLoggingOut(false);
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
