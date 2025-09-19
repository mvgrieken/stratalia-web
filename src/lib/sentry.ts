import { logger } from '@/lib/logger';

/**
 * Lightweight Sentry-ready hook (no dependency).
 * If SENTRY_DSN is set, we log captures as a stub so wiring is centralized.
 * Swap implementation with real Sentry SDK later without changing callsites.
 */
const SENTRY_DSN = process.env.SENTRY_DSN;

export function isSentryEnabled(): boolean {
  return Boolean(SENTRY_DSN);
}

export function captureException(error: unknown, context?: Record<string, unknown>): void {
  if (!isSentryEnabled()) return;
  const msg = error instanceof Error ? error.message : String(error);
  // Stub: emit a structured log; replace with @sentry/node captureException later
  logger.error(`Sentry capture: ${msg} ${JSON.stringify(context || {})}`);
}


