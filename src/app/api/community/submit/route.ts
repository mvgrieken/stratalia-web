import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

interface CommunitySubmission {
  word: string;
  definition: string;
  example?: string;
  context?: string;
  source?: string;
  notes?: string;
}

export async function POST(request: NextRequest) {
  try {
    const body: CommunitySubmission = await request.json();
    const { word, definition, example, context, source, notes } = body;

    console.log(`📝 Community submission received for word: "${word}"`);

    // Validate required fields
    if (!word || !definition) {
      return NextResponse.json({
        error: 'Missing required fields',
        details: 'Word and definition are required'
      }, { status: 400 });
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

    // Insert submission
    const { data, error } = await supabase
      .from('community_submissions')
      .insert({
        word: word.trim(),
        definition: definition.trim(),
        example: example?.trim() || null,
        context: context?.trim() || null,
        source: source?.trim() || null,
        notes: notes?.trim() || null,
        status: 'pending',
        submitted_by: 'anonymous'
      })
      .select()
      .single();

    if (error) {
      console.error('❌ Error inserting community submission:', error);
      return NextResponse.json({
        error: 'Failed to submit word',
        details: error.message
      }, { status: 500 });
    }

    console.log(`✅ Community submission created with ID: ${data.id}`);

    return NextResponse.json({
      success: true,
      message: 'Woord succesvol ingediend voor beoordeling',
      submission_id: data.id
    });

  } catch (error) {
    console.error('💥 Error in community submission API:', error);
    return NextResponse.json({
      error: 'Internal server error',
      details: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 });
  }
}

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const status = searchParams.get('status') || 'approved';
    const limit = parseInt(searchParams.get('limit') || '20');

    console.log(`📝 Fetching community submissions - Status: ${status}, Limit: ${limit}`);

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

    // Fetch submissions
    const { data: submissions, error } = await supabase
      .from('community_submissions')
      .select('*')
      .eq('status', status)
      .order('created_at', { ascending: false })
      .limit(limit);

    if (error) {
      console.error('❌ Error fetching community submissions:', error);
      return NextResponse.json({
        error: 'Database unavailable',
        details: error.message
      }, { status: 500 });
    }

    console.log(`✅ Found ${submissions?.length || 0} community submissions`);

    return NextResponse.json(submissions || []);

  } catch (error) {
    console.error('💥 Error in community submissions API:', error);
    return NextResponse.json({
      error: 'Internal server error',
      details: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 });
  }
}