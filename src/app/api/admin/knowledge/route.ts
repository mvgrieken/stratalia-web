import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import { logger } from '@/lib/logger';
import { normalizeError } from '@/lib/errors';
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;
export async function GET(_request: NextRequest) {
  try {
    // Create admin client with service role key
    const supabase = createClient(supabaseUrl, supabaseServiceKey);
    // Fetch all knowledge items
    const { data: items, error } = await supabase
      .from('knowledge_items')
      .select('*')
      .order('created_at', { ascending: false });
    if (error) {
      const normalized = normalizeError(error);
    logger.error('❌ Error fetching knowledge items:', normalized);
      return NextResponse.json(
        { error: 'Failed to fetch knowledge items' },
        { status: 500 }
      );
    }
    logger.info(`✅ Fetched ${items?.length || 0} knowledge items for admin`);
    return NextResponse.json({
      items: items || [],
      total: items?.length || 0
    });
  } catch (error) {
    const normalized = normalizeError(error);
    logger.error('❌ Error in admin knowledge API:', normalized);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { title, content, type, difficulty } = body;
    if (!title || !content || !type) {
      return NextResponse.json(
        { error: 'Title, content, and type are required' },
        { status: 400 }
      );
    }
    // Create admin client with service role key
    const supabase = createClient(supabaseUrl, supabaseServiceKey);
    // Insert new knowledge item
    const { data, error } = await supabase
      .from('knowledge_items')
      .insert({
        title,
        content,
        type,
        difficulty: difficulty || 'medium',
        status: 'approved' // Auto-approve admin created content
      })
      .select()
      .single();
    if (error) {
      const normalized = normalizeError(error);
    logger.error('❌ Error creating knowledge item:', normalized);
      return NextResponse.json(
        { error: 'Failed to create knowledge item' },
        { status: 500 }
      );
    }
    logger.info(`✅ Created new knowledge item: ${title}`);
    return NextResponse.json({
      item: data,
      message: 'Knowledge item created successfully'
    });
  } catch (error) {
    const normalized = normalizeError(error);
    logger.error('❌ Error in admin knowledge POST API:', normalized);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
