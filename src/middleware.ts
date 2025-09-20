import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

export async function middleware(request: NextRequest) {
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
  
  // Note: Auth gating is handled client-side for now; admin APIs enforce server checks.
  
  // Handle CORS for API routes
  if (request.nextUrl.pathname.startsWith('/api/')) {
    const requestOrigin = request.headers.get('origin') ?? ''
    const allowedOrigins = new Set<string>([
      'https://stratalia.nl',
      'https://www.stratalia.nl',
    ])
    const appUrl = process.env.NEXT_PUBLIC_APP_URL
    if (appUrl) allowedOrigins.add(appUrl)
    const vercelUrl = process.env.VERCEL_URL
    if (vercelUrl) {
      const url = vercelUrl.startsWith('http') ? vercelUrl : `https://${vercelUrl}`
      allowedOrigins.add(url)
    }

    const originAllowed = requestOrigin && [...allowedOrigins].some(o => o === requestOrigin)
    if (originAllowed) {
      response.headers.set('Access-Control-Allow-Origin', requestOrigin)
    }
    response.headers.set('Vary', 'Origin')
    response.headers.set('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS')
    response.headers.set('Access-Control-Allow-Headers', 'Content-Type, Authorization')
    response.headers.set('Access-Control-Max-Age', '86400')

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
