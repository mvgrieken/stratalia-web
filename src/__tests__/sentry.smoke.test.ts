import { describe, it, expect } from 'vitest'
import { isSentryEnabled, captureException } from '@/lib/sentry'

describe('sentry stub', () => {
  it('should not throw when DSN missing', () => {
    const original = process.env.SENTRY_DSN
    delete process.env.SENTRY_DSN
    expect(isSentryEnabled()).toBe(false)
    expect(() => captureException(new Error('test no dsn'))).not.toThrow()
    if (original) process.env.SENTRY_DSN = original
  })
})


