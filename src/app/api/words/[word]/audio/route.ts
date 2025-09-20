import { NextRequest, NextResponse } from 'next/server';
import { getSupabaseServiceClient } from '@/lib/supabase-client';
import { logger } from '@/lib/logger';
import { withApiError } from '@/lib/api-wrapper';

export const dynamic = 'force-dynamic';

export const GET = withApiError(async (request: NextRequest, { params }: { params: { word: string } }) => {
  const { word } = params;

  if (!word) {
    return NextResponse.json({ error: 'Word parameter is required' }, { status: 400 });
  }

  try {
    const supabase = getSupabaseServiceClient();
    const normalizedWord = word.toLowerCase().trim();

    // Fetch word audio information
    const { data: wordData, error: wordError } = await supabase
      .from('words')
      .select('id, word, audio_url, audio_file_path')
      .eq('word', normalizedWord)
      .eq('is_active', true)
      .single();

    if (wordError || !wordData) {
      logger.warn(`Word not found for audio: ${wordError?.message || 'No data'}`);
      return NextResponse.json({ error: 'Word not found' }, { status: 404 });
    }

    // Check if audio file exists
    const audioUrl = wordData.audio_url || wordData.audio_file_path;
    
    if (!audioUrl) {
      return NextResponse.json({ 
        hasAudio: false,
        message: 'No audio file available for this word',
        fallback: 'speech_synthesis'
      });
    }

    // If it's a Supabase storage URL, generate a signed URL
    if (audioUrl.includes('supabase') && audioUrl.includes('storage')) {
      try {
        // Extract bucket and path from URL
        const urlParts = audioUrl.split('/storage/v1/object/public/');
        if (urlParts.length === 2) {
          const [bucket, path] = urlParts[1].split('/');
          
          const { data: signedUrl, error: signedError } = await supabase.storage
            .from(bucket)
            .createSignedUrl(path, 3600); // 1 hour expiry

          if (signedError) {
            logger.error(`Failed to create signed URL: ${signedError.message}`);
            return NextResponse.json({ 
              hasAudio: false,
              message: 'Failed to generate audio URL',
              fallback: 'speech_synthesis'
            });
          }

          return NextResponse.json({
            hasAudio: true,
            audioUrl: signedUrl.signedUrl,
            word: wordData.word,
            source: 'supabase_storage'
          });
        }
      } catch (error) {
        logger.error(`Error processing Supabase storage URL: ${error instanceof Error ? error.message : String(error)}`);
      }
    }

    // Return direct URL if it's not a Supabase storage URL
    return NextResponse.json({
      hasAudio: true,
      audioUrl: audioUrl,
      word: wordData.word,
      source: 'direct_url'
    });

  } catch (error) {
    logger.error('Error fetching word audio:', error instanceof Error ? error : new Error(String(error)));
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
});

export const POST = withApiError(async (request: NextRequest, { params }: { params: { word: string } }) => {
  const { word } = params;
  const { audioUrl, audioFile } = await request.json();

  if (!word) {
    return NextResponse.json({ error: 'Word parameter is required' }, { status: 400 });
  }

  try {
    const supabase = getSupabaseServiceClient();
    const normalizedWord = word.toLowerCase().trim();

    // Update word with audio URL
    const { data, error } = await supabase
      .from('words')
      .update({ 
        audio_url: audioUrl,
        updated_at: new Date().toISOString()
      })
      .eq('word', normalizedWord)
      .eq('is_active', true)
      .select()
      .single();

    if (error) {
      logger.error(`Failed to update word audio: ${error.message}`);
      return NextResponse.json({ error: 'Failed to update audio' }, { status: 500 });
    }

    logger.info(`Audio URL updated for word: ${normalizedWord}`);

    return NextResponse.json({
      success: true,
      word: data.word,
      audioUrl: data.audio_url
    });

  } catch (error) {
    logger.error('Error updating word audio:', error instanceof Error ? error : new Error(String(error)));
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
});
