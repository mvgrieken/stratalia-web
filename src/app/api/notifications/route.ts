import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import { logger } from '@/lib/logger';
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const userId = searchParams.get('user_id');
    const unreadOnly = searchParams.get('unread_only') === 'true';
    const limit = parseInt(searchParams.get('limit') || '20');
    if (!userId) {
      return NextResponse.json({
        error: 'User ID is required'
      }, { status: 400 });
    }
    logger.info(`🔔 Fetching notifications - User: ${userId}, Unread only: ${unreadOnly}, Limit: ${limit}`);
    // Initialize Supabase client
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const supabaseServiceKey = process.env.SUPABASE_SERVICE_KEY;
    if (!supabaseUrl || !supabaseServiceKey) {
      return NextResponse.json({
        error: 'Server configuration error'
      }, { status: 500 });
    }
    const supabase = createClient(supabaseUrl, supabaseServiceKey);
    // Build query
    let query = supabase
      .from('notifications')
      .select('*')
      .eq('user_id', userId)
      .order('created_at', { ascending: false })
      .limit(limit);
    if (unreadOnly) {
      query = query.is('read_at', null);
    }
    const { data: notifications, error } = await query;
    if (error) {
      logger.error('❌ Error fetching notifications:', error);
      return NextResponse.json({
        error: 'Failed to fetch notifications',
        details: error.message
      }, { status: 500 });
    }
    // Get unread count
    const { count: unreadCount, error: countError } = await supabase
      .from('notifications')
      .select('*', { count: 'exact', head: true })
      .eq('user_id', userId)
      .is('read_at', null);
    if (countError) {
      logger.error('❌ Error fetching unread count:', countError);
    }
    return NextResponse.json({
      notifications: notifications || [],
      unread_count: unreadCount || 0,
      total_count: notifications?.length || 0
    });
  } catch (error) {
    logger.error('💥 Error in notifications API:', error);
    return NextResponse.json({
      error: 'Internal server error',
      details: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 });
  }
}
export async function POST(request: NextRequest) {
  try {
    const { user_id, notification_type, title, message, data } = await request.json();
    if (!user_id || !notification_type || !title || !message) {
      return NextResponse.json({
        error: 'user_id, notification_type, title, and message are required'
      }, { status: 400 });
    }
    logger.info(`🔔 Creating notification - User: ${user_id}, Type: ${notification_type}`);
    // Initialize Supabase client
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const supabaseServiceKey = process.env.SUPABASE_SERVICE_KEY;
    if (!supabaseUrl || !supabaseServiceKey) {
      return NextResponse.json({
        error: 'Server configuration error'
      }, { status: 500 });
    }
    const supabase = createClient(supabaseUrl, supabaseServiceKey);
    // Create notification
    const { data: notification, error } = await supabase
      .from('notifications')
      .insert({
        user_id,
        notification_type,
        title,
        message,
        data: data || {}
      })
      .select()
      .single();
    if (error) {
      logger.error('❌ Error creating notification:', error);
      return NextResponse.json({
        error: 'Failed to create notification',
        details: error.message
      }, { status: 500 });
    }
    return NextResponse.json({
      success: true,
      notification
    });
  } catch (error) {
    logger.error('💥 Error in notification creation API:', error);
    return NextResponse.json({
      error: 'Internal server error',
      details: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 });
  }
}
export async function PUT(request: NextRequest) {
  try {
    const { notification_id, user_id } = await request.json();
    if (!notification_id || !user_id) {
      return NextResponse.json({
        error: 'notification_id and user_id are required'
      }, { status: 400 });
    }
    logger.info(`🔔 Marking notification as read - ID: ${notification_id}, User: ${user_id}`);
    // Initialize Supabase client
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const supabaseServiceKey = process.env.SUPABASE_SERVICE_KEY;
    if (!supabaseUrl || !supabaseServiceKey) {
      return NextResponse.json({
        error: 'Server configuration error'
      }, { status: 500 });
    }
    const supabase = createClient(supabaseUrl, supabaseServiceKey);
    // Mark notification as read
    const { data: notification, error } = await supabase
      .from('notifications')
      .update({ read_at: new Date().toISOString() })
      .eq('id', notification_id)
      .eq('user_id', user_id)
      .select()
      .single();
    if (error) {
      logger.error('❌ Error marking notification as read:', error);
      return NextResponse.json({
        error: 'Failed to mark notification as read',
        details: error.message
      }, { status: 500 });
    }
    return NextResponse.json({
      success: true,
      notification
    });
  } catch (error) {
    logger.error('💥 Error in notification read API:', error);
    return NextResponse.json({
      error: 'Internal server error',
      details: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 });
  }
}
