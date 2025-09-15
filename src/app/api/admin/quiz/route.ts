import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;

export async function GET(_request: NextRequest) {
  try {
    // Create admin client with service role key
    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    // Fetch all quiz questions
    const { data: questions, error } = await supabase
      .from('quiz_questions')
      .select('*')
      .order('created_at', { ascending: false });

    if (error) {
      console.error('❌ Error fetching quiz questions:', error);
      return NextResponse.json(
        { error: 'Failed to fetch quiz questions' },
        { status: 500 }
      );
    }

    console.log(`✅ Fetched ${questions?.length || 0} quiz questions for admin`);

    return NextResponse.json({
      questions: questions || [],
      total: questions?.length || 0
    });

  } catch (error) {
    console.error('❌ Error in admin quiz API:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { question, correct_answer, wrong_answers, difficulty } = body;

    if (!question || !correct_answer || !wrong_answers || !Array.isArray(wrong_answers)) {
      return NextResponse.json(
        { error: 'Question, correct_answer, and wrong_answers array are required' },
        { status: 400 }
      );
    }

    // Create admin client with service role key
    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    // Insert new quiz question
    const { data, error } = await supabase
      .from('quiz_questions')
      .insert({
        question,
        correct_answer,
        wrong_answers,
        difficulty: difficulty || 'medium'
      })
      .select()
      .single();

    if (error) {
      console.error('❌ Error creating quiz question:', error);
      return NextResponse.json(
        { error: 'Failed to create quiz question' },
        { status: 500 }
      );
    }

    console.log(`✅ Created new quiz question: ${question}`);

    return NextResponse.json({
      question: data,
      message: 'Quiz question created successfully'
    });

  } catch (error) {
    console.error('❌ Error in admin quiz POST API:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
