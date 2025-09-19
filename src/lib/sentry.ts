import { logger } from '@/lib/logger';
import * as Sentry from '@sentry/node';

const SENTRY_DSN = process.env.SENTRY_DSN;
let sentryInitialized = false;

function initSentry(): void {
  if (sentryInitialized || !SENTRY_DSN) return;
  Sentry.init({
    dsn: SENTRY_DSN,
    environment: process.env.NODE_ENV,
    tracesSampleRate: Number.parseFloat(process.env.SENTRY_TRACES_SAMPLE_RATE || '0'),
    enabled: true,
  });
  sentryInitialized = true;
}

export function isSentryEnabled(): boolean {
  return Boolean(SENTRY_DSN);
}

export function captureException(error: unknown, context?: Record<string, unknown>): void {
  if (!isSentryEnabled()) return;
  try {
    initSentry();
    Sentry.withScope((scope) => {
      scope.setTag('app', 'stratalia-web');
      if (context) {
        for (const [key, value] of Object.entries(context)) {
          scope.setExtra(key, value as unknown as string);
        }
      }
      Sentry.captureException(error instanceof Error ? error : new Error(String(error)));
    });
  } catch (sdkError) {
    const msg = sdkError instanceof Error ? sdkError.message : String(sdkError);
    logger.error(`Sentry capture failed: ${msg}`);
  }
}


