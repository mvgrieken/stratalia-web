import { NextRequest, NextResponse } from 'next/server'
import { z, ZodSchema } from 'zod'
import { AppError, ErrorCode, createErrorResponse } from '@/lib/errors'
import { logger } from '@/lib/logger'
import { captureException, isSentryEnabled } from '@/lib/sentry'

type Handler = (..._args: any[]) => Promise<NextResponse>

export function withZod<Schema extends ZodSchema<any>>(schema: Schema, handler: Handler): Handler {
  return async (...args: any[]) => {
    const req = args[0] as NextRequest
    const url = new URL(req.url)
    const query = Object.fromEntries(url.searchParams.entries())
    const json = req.method !== 'GET' ? await safeParseJson(req) : undefined
    const data = { ...query, ...(json || {}) }

    const parsed = schema.safeParse(data)
    if (!parsed.success) {
      const msg = parsed.error.issues.map(i => `${i.path.join('.')}: ${i.message}`).join('; ')
      return createErrorResponse(new AppError(ErrorCode.VALIDATION_ERROR, msg, 400))
    }

    return handler(...args)
  }
}

export function withApiError(handler: Handler): Handler {
  return async (...args: any[]) => {
    try {
      return await handler(...args)
    } catch (err) {
      const error = err instanceof AppError ? err : new AppError(ErrorCode.INTERNAL_ERROR, 'Internal server error', 500)
      logger.error(`API handler error: ${error.message}`)
      const req = args[0] as NextRequest
      if (req && isSentryEnabled()) captureException(err, { route: req.nextUrl?.pathname })
      return createErrorResponse(error)
    }
  }
}

async function safeParseJson(req: NextRequest): Promise<unknown | undefined> {
  try {
    return await req.json()
  } catch {
    return undefined
  }
}


