import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { word, definition, example, context, source } = body;

    // Validate required fields
    if (!word || !definition) {
      return NextResponse.json({ error: 'Word and definition are required' }, { status: 400 });
    }

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

    // Check if word already exists
    const { data: existingWord } = await supabase
      .from('words')
      .select('id')
      .eq('word', word.toLowerCase())
      .single();

    if (existingWord) {
      return NextResponse.json({ error: 'This word already exists in our database' }, { status: 409 });
    }

    // Save community submission
    const { data, error } = await supabase
      .from('community_submissions')
      .insert({
        word: word.toLowerCase(),
        definition,
        example: example || null,
        context: context || null,
        source: source || null,
        status: 'pending'
      })
      .select()
      .single();

    if (error) {
      console.error('Error saving community submission:', error);
      return NextResponse.json({ error: 'Failed to save submission' }, { status: 500 });
    }

    return NextResponse.json({ 
      success: true, 
      id: data.id,
      message: 'Your submission has been received and will be reviewed by our team.'
    });
  } catch (error) {
    console.error('Error in community submit API:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
