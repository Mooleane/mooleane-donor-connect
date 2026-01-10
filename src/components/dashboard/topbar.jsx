'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';

function formatTitle(pathname) {
  if (pathname === '/' || pathname === '/home') return 'Home';
  const parts = pathname.split('/').filter(Boolean);
  const lastPart = parts[parts.length - 1];
  if (!lastPart) return 'Dashboard';
  return lastPart.charAt(0).toUpperCase() + lastPart.slice(1).replace(/-/g, ' ');
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
