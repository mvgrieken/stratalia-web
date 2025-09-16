import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import { logger } from '@/lib/logger';
import { normalizeError } from '@/lib/errors';
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;
export async function GET() {
  try {
    // Create admin client with service role key
    const supabase = createClient(supabaseUrl, supabaseServiceKey);
    // Fetch all words
    const { data: words, error } = await supabase
      .from('words')
      .select('*')
      .order('created_at', { ascending: false });
    if (error) {
      const normalized = normalizeError(error);
    logger.error('❌ Error fetching words:', normalized);
      return NextResponse.json(
        { error: 'Failed to fetch words' },
        { status: 500 }
      );
    }
    logger.info(`✅ Fetched ${words?.length || 0} words for admin`);
    return NextResponse.json({
      words: words || [],
      total: words?.length || 0
    });
  } catch (error) {
    const normalized = normalizeError(error);
    logger.error('❌ Error in admin words API:', normalized);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { word, meaning, example, difficulty } = body;
    if (!word || !meaning) {
      return NextResponse.json(
        { error: 'Word and meaning are required' },
        { status: 400 }
      );
    }
    // Create admin client with service role key
    const supabase = createClient(supabaseUrl, supabaseServiceKey);
    // Insert new word
    const { data, error } = await supabase
      .from('words')
      .insert({
        word: word.toLowerCase().trim(),
        meaning,
        example: example || null,
        difficulty: difficulty || 'medium'
      })
      .select()
      .single();
    if (error) {
      const normalized = normalizeError(error);
    logger.error('❌ Error creating word:', normalized);
      return NextResponse.json(
        { error: 'Failed to create word' },
        { status: 500 }
      );
    }
    logger.info(`✅ Created new word: ${word}`);
    return NextResponse.json({
      word: data,
      message: 'Word created successfully'
    });
  } catch (error) {
    const normalized = normalizeError(error);
    logger.error('❌ Error in admin words POST API:', normalized);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
