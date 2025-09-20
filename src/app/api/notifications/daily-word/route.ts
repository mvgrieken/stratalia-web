import { NextRequest, NextResponse } from 'next/server';
import { withApiError } from '@/lib/api-wrapper';
import { getSupabaseServiceClient } from '@/lib/supabase-client';
import { logger } from '@/lib/logger';

export const POST = withApiError(async (request: NextRequest) => {
  const { user_id, word, meaning, date } = await request.json();
  
  if (!user_id || !word || !meaning) {
    return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
  }

  const supabase = getSupabaseServiceClient();

  try {
    // Check if user has already received notification today
    const today = date || new Date().toISOString().slice(0, 10);
    const { data: existing } = await supabase
      .from('user_notifications')
      .select('id')
      .eq('user_id', user_id)
      .eq('type', 'daily_word')
      .eq('date', today)
      .single();

    if (existing) {
      return NextResponse.json({ message: 'Notification already sent today' });
    }

    // Create notification record
    const { data: notification, error } = await supabase
      .from('user_notifications')
      .insert({
        user_id,
        type: 'daily_word',
        title: 'Woord van de dag',
        message: `${word} - ${meaning}`,
        data: { word, meaning, date: today },
        date: today,
        sent: true
      })
      .select()
      .single();

    if (error) {
      logger.error('Failed to create notification:', error);
      return NextResponse.json({ error: 'Failed to create notification' }, { status: 500 });
    }

    // TODO: Integrate with push notification service (FCM, APNs, etc.)
    // For now, just log the notification
    logger.info(`Daily word notification created for user ${user_id}: ${word}`);

    return NextResponse.json({ 
      success: true, 
      notification_id: notification.id,
      message: 'Notification queued for delivery'
    });

  } catch (error) {
    logger.error('Notification service error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
});
