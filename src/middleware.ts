import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'
import { createServerClient } from '@supabase/ssr'

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
  
  // Enhanced session management and email verification handling
  if (request.nextUrl.pathname.startsWith('/dashboard') || 
      request.nextUrl.pathname.startsWith('/profile') ||
      request.nextUrl.pathname.startsWith('/admin')) {
    
    try {
      // Create Supabase client for middleware
      const supabase = createServerClient(
        process.env.NEXT_PUBLIC_SUPABASE_URL!,
        process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
        {
          cookies: {
            get(name: string) {
              return request.cookies.get(name)?.value
            },
            set(name: string, value: string, options: any) {
              response.cookies.set({
                name,
                value,
                ...options,
              })
            },
            remove(name: string, options: any) {
              response.cookies.set({
                name,
                value: '',
                ...options,
              })
            },
          },
        }
      )

      // Check authentication
      const { data: { session }, error } = await supabase.auth.getSession()
      
      if (error || !session) {
        // Redirect to login with return URL
        const loginUrl = new URL('/login', request.url)
        loginUrl.searchParams.set('redirect_to', request.nextUrl.pathname)
        return NextResponse.redirect(loginUrl)
      }

      // Check email verification for protected routes
      if (!session.user.email_confirmed_at) {
        // Allow access to dashboard but show verification notice
        // The client-side components will handle showing verification status
        response.headers.set('X-Email-Verified', 'false')
      } else {
        response.headers.set('X-Email-Verified', 'true')
      }

      // Add user info to headers for client-side access
      response.headers.set('X-User-ID', session.user.id)
      response.headers.set('X-User-Email', session.user.email || '')
      
    } catch (error) {
      // If there's an error with session handling, redirect to login
      const loginUrl = new URL('/login', request.url)
      loginUrl.searchParams.set('redirect_to', request.nextUrl.pathname)
      return NextResponse.redirect(loginUrl)
    }
  }
  
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
