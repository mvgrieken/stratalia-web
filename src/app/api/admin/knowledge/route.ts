import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;

export async function GET(request: NextRequest) {
  try {
    // Create admin client with service role key
    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    // Fetch all knowledge items
    const { data: items, error } = await supabase
      .from('knowledge_items')
      .select('*')
      .order('created_at', { ascending: false });

    if (error) {
      console.error('❌ Error fetching knowledge items:', error);
      return NextResponse.json(
        { error: 'Failed to fetch knowledge items' },
        { status: 500 }
      );
    }

    console.log(`✅ Fetched ${items?.length || 0} knowledge items for admin`);

    return NextResponse.json({
      items: items || [],
      total: items?.length || 0
    });

  } catch (error) {
    console.error('❌ Error in admin knowledge API:', error);
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
      console.error('❌ Error creating knowledge item:', error);
      return NextResponse.json(
        { error: 'Failed to create knowledge item' },
        { status: 500 }
      );
    }

    console.log(`✅ Created new knowledge item: ${title}`);

    return NextResponse.json({
      item: data,
      message: 'Knowledge item created successfully'
    });

  } catch (error) {
    console.error('❌ Error in admin knowledge POST API:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
