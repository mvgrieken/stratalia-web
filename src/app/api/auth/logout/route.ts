import { NextResponse } from 'next/server';
import { logger } from '@/lib/logger';
import { normalizeError } from '@/lib/errors';
import { withApiError } from '@/lib/api-wrapper';

export const POST = withApiError(async () => {
  // For now, just return success; session invalidation can be added later
  return NextResponse.json({ message: 'Logged out successfully' });
});
