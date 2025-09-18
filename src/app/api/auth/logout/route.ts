import { NextResponse } from 'next/server';
import { logger } from '@/lib/logger';
import { normalizeError } from '@/lib/errors';
export async function POST() {
  try {
    // For now, just return success
    // In a real implementation, you might want to invalidate the session
    return NextResponse.json({ message: 'Logged out successfully' });
  } catch (error) {
    const normalized = normalizeError(error);
    logger.error(`Error in logout: ${normalized}`);
    return NextResponse.json({ error: 'Logout failed' }, { status: 500 });
  }
}
