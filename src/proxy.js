// Next.js Middleware - Route protection and authentication
import { NextResponse } from 'next/server'
import { cookies } from 'next/headers'

// Routes that require authentication
const protectedRoutes = ['/dashboard', '/donors', '/campaigns', '/donations', '/segments', '/workflows', '/tasks']

// Routes that should redirect to dashboard if already authenticated
const authRoutes = ['/login', '/register']

export async function proxy(request) {
  // TODO: Get session token from cookies
  // TODO: Check if current path requires authentication
  // TODO: Validate session by calling session API
  // TODO: Redirect unauthenticated users to login
  // TODO: Redirect authenticated users away from auth pages
  // TODO: Preserve intended destination after login
}

export const config = {
  matcher: [
    /*
     * Match all request paths except:
     * - api routes (except auth check)
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     * - public files (public directory)
     */
    '/((?!api|_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)',
  ],
}