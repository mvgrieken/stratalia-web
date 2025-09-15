import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const type = searchParams.get('type') || 'all';
    const difficulty = searchParams.get('difficulty') || 'all';
    const limit = parseInt(searchParams.get('limit') || '50');

    console.log(`📚 Fetching knowledge items - Type: ${type}, Difficulty: ${difficulty}, Limit: ${limit}`);

    // Initialize Supabase client
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
    
    if (!supabaseUrl || !supabaseAnonKey) {
      console.error('❌ Supabase environment variables are missing!');
      return NextResponse.json({
        error: 'Database configuration missing'
      }, { status: 500 });
    }

    const supabase = createClient(supabaseUrl, supabaseAnonKey);

    // Build query
    let query = supabase
      .from('knowledge_items')
      .select('*')
      .eq('is_active', true)
      .limit(limit);

    // Apply filters
    if (type !== 'all') {
      query = query.eq('type', type);
    }

    if (difficulty !== 'all') {
      query = query.eq('difficulty', difficulty);
    }

    const { data: items, error } = await query;

    if (error) {
      console.error('❌ Error fetching knowledge items:', error);
      return NextResponse.json({
        error: 'Database unavailable',
        details: error.message
      }, { status: 500 });
    }

    console.log(`✅ Found ${items?.length || 0} knowledge items`);

    return NextResponse.json(items || []);

  } catch (error) {
    console.error('💥 Error in knowledge items API:', error);
    return NextResponse.json({
      error: 'Internal server error',
      details: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 });
  }
}