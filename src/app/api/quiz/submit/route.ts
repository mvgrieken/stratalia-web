import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import { logger } from '@/lib/logger';
import { normalizeError } from '@/lib/errors';
import { isSupabaseConfigured } from '@/lib/config';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { score, totalQuestions, percentage, timeTaken, difficulty = 'medium' } = body;

    // Validate input
    if (typeof score !== 'number' || typeof totalQuestions !== 'number' || score < 0 || totalQuestions <= 0) {
      return NextResponse.json({
        error: 'Invalid quiz data provided',
        details: 'Score and totalQuestions must be valid numbers'
      }, { status: 400 });
    }

    logger.info(`Quiz submission: score=${score}/${totalQuestions}, percentage=${percentage}%, time=${timeTaken}ms, difficulty=${difficulty}`);

    // Try to save to database if Supabase is configured
    if (isSupabaseConfigured()) {
      try {
        const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
        const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;
        const supabase = createClient(supabaseUrl, supabaseAnonKey);

        const { data, error } = await supabase
          .from('quiz_sessions')
          .insert({
            score,
            total_questions: totalQuestions,
            correct_answers: score,
            percentage: percentage || Math.round((score / totalQuestions) * 100),
            time_taken: timeTaken,
            difficulty,
            completed_at: new Date().toISOString()
          })
          .select()
          .single();

        if (error) {
          const normalized = normalizeError(error);
          logger.warn(`Database save failed, using fallback: ${normalized.message}`);
        } else {
          logger.info(`Quiz result saved successfully: id=${data.id}`);
          return NextResponse.json({ 
            success: true, 
            id: data.id,
            message: 'Quiz result saved successfully',
            source: 'database'
          });
        }
      } catch (dbError) {
        const normalized = normalizeError(dbError);
        logger.warn(`Database unavailable, using fallback: ${normalized.message}`);
      }
    } else {
      logger.info('Supabase not configured, using fallback mode');
    }

    // Fallback: Return success without saving (for demo/offline mode)
    const fallbackId = `fallback-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
    
    logger.info(`Quiz result processed in fallback mode: id=${fallbackId}`);
    
    return NextResponse.json({ 
      success: true, 
      id: fallbackId,
      message: 'Quiz result processed (offline mode)',
      source: 'fallback'
    });

  } catch (error) {
    const normalized = normalizeError(error);
    logger.error('Error in quiz submit API:', normalized);
    return NextResponse.json({ 
      error: 'Failed to process quiz result',
      details: process.env.NODE_ENV === 'development' ? normalized.message : undefined
    }, { status: 500 });
  }
}
