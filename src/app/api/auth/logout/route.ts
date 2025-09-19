import { NextResponse } from 'next/server';
import { withApiError } from '@/lib/api-wrapper';

export const POST = withApiError(async () => {
  // For now, just return success; session invalidation can be added later
  return NextResponse.json({ message: 'Logged out successfully' });
});
