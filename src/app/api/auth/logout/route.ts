import { NextRequest, NextResponse } from 'next/server';

export async function POST(_request: NextRequest) {
  try {
    // For now, just return success
    // In a real implementation, you might want to invalidate the session
    return NextResponse.json({ message: 'Logged out successfully' });
  } catch (error) {
    console.error('Error in logout:', error);
    return NextResponse.json({ error: 'Logout failed' }, { status: 500 });
  }
}
