import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

export function middleware(request: NextRequest) {
  const response = NextResponse.next()
  
  // Add security headers to all responses
  response.headers.set('X-Content-Type-Options', 'nosniff')
  response.headers.set('X-Frame-Options', 'DENY')
  response.headers.set('X-XSS-Protection', '1; mode=block')
  response.headers.set('Referrer-Policy', 'strict-origin-when-cross-origin')
  
  // CSP temporarily disabled for development
  // response.headers.set(
  //   'Content-Security-Policy',
  //   "default-src 'self'; script-src 'self' 'unsafe-inline' 'unsafe-eval'; style-src 'self' 'unsafe-inline'; img-src 'self' data: https:; font-src 'self' data:; connect-src 'self' https://*.supabase.co; frame-ancestors 'none'; object-src 'none'; base-uri 'self'; worker-src 'self'; manifest-src 'self';"
  // )
  
  // Protected routes that require authentication
  const protectedRoutes = ['/quiz', '/community', '/leaderboard', '/challenges', '/dashboard', '/profile', '/notifications']
  const currentPath = request.nextUrl.pathname
  
  // Check if the current path is a protected route
  const isProtectedRoute = protectedRoutes.some(route => currentPath.startsWith(route))
  
  if (isProtectedRoute) {
    // Check for Supabase authentication session
    const supabaseAccessToken = request.cookies.get('sb-ahcvmgwbvfgrnwuyxmzi-auth-token')
    
    // Also check for generic Supabase cookies
    const hasAuthSession = request.cookies.getAll().some(cookie => 
      cookie.name.includes('sb-') && cookie.name.includes('auth-token')
    )
    
    if (!hasAuthSession && !supabaseAccessToken) {
      // Redirect to login with the current path as redirect_to parameter
      const loginUrl = new URL('/login', request.url)
      loginUrl.searchParams.set('redirect_to', currentPath)
      return NextResponse.redirect(loginUrl)
    }
  }
  
  // Handle CORS for API routes
  if (request.nextUrl.pathname.startsWith('/api/')) {
    // Add CORS headers
    response.headers.set('Access-Control-Allow-Origin', '*')
    response.headers.set('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS')
    response.headers.set('Access-Control-Allow-Headers', 'Content-Type, Authorization')
    
    // Handle preflight requests
    if (request.method === 'OPTIONS') {
      return new Response(null, { status: 200, headers: response.headers })
    }
  }
  
  return response
}

export const config = {
  matcher: [
    '/api/:path*',
    '/((?!_next/static|_next/image|favicon.ico).*)',
  ],
}
