import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

interface TranslationRequest {
  text: string;
  direction: 'to_slang' | 'to_formal';
  context?: string;
}

interface TranslationResponse {
  translation: string;
  confidence: number;
  alternatives: string[];
  explanation: string;
  etymology?: string;
}

export async function POST(request: NextRequest) {
  try {
    const body: TranslationRequest = await request.json();
    const { text, direction, context } = body;

    if (!text || !direction) {
      return NextResponse.json({ error: 'Text and direction are required' }, { status: 400 });
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

    // Use Supabase data for translation
    const translation = await generateTranslation(text, direction, context, supabase);

    return NextResponse.json(translation);
  } catch (error) {
    console.error('Error in AI translation:', error);
    return NextResponse.json({ error: 'Translation failed' }, { status: 500 });
  }
}

async function generateTranslation(
  text: string, 
  direction: 'to_slang' | 'to_formal', 
  _context?: string,
  supabase?: any
): Promise<TranslationResponse> {
  try {
    console.log(`🔄 Translating: "${text}" (${direction})`);

    if (!supabase) {
      throw new Error('Supabase client not provided');
    }

    // Get words from Supabase database
    const { data: words, error: wordsError } = await supabase
      .from('words')
      .select(`
        id,
        word,
        meaning,
        example,
        word_variants (
          id,
          variant,
          meaning,
          example
        )
      `);

    if (wordsError) {
      console.error('❌ Error fetching words:', wordsError);
      throw new Error('Failed to fetch words from database');
    }

    // Create translation lookup from database
    const translationLookup: Record<string, { formal: string, slang: string, explanation: string }> = {};
    
    if (words) {
      words.forEach((word: any) => {
        const slangWord = word.word.toLowerCase();
        const formalMeaning = word.meaning;
        const explanation = `"${word.word}" betekent ${formalMeaning}${word.example ? `. Voorbeeld: ${word.example}` : ''}`;
        
        translationLookup[slangWord] = {
          formal: formalMeaning,
          slang: slangWord,
          explanation: explanation
        };

        // Add variants
        if (word.word_variants) {
          word.word_variants.forEach((variant: any) => {
            const variantSlang = variant.variant.toLowerCase();
            const variantFormal = variant.meaning;
            const variantExplanation = `"${variant.variant}" betekent ${variantFormal}${variant.example ? `. Voorbeeld: ${variant.example}` : ''}`;
            
            translationLookup[variantSlang] = {
              formal: variantFormal,
              slang: variantSlang,
              explanation: variantExplanation
            };
          });
        }
      });
    }

    const wordsToTranslate = text.toLowerCase().split(' ');
    let translation = text;
    let confidence = 0.8;
    const alternatives: string[] = [];
    let explanation = '';
    let etymology = '';

    if (direction === 'to_slang') {
      // Translate formal Dutch to slang
      const translatedWords = wordsToTranslate.map(word => {
        const cleanWord = word.replace(/[.,!?]/g, '');
        const found = Object.entries(translationLookup).find(([, data]) => 
          data.formal.toLowerCase().includes(cleanWord)
        );
        return found ? found[0] : word;
      });
      translation = translatedWords.join(' ');
      explanation = 'Deze vertaling gebruikt moderne straattaal uit onze database.';
      etymology = 'Straattaal ontwikkelt zich continu en wordt beïnvloed door verschillende culturen en media.';
    } else {
      // Translate slang to formal Dutch
      const translatedWords = wordsToTranslate.map(word => {
        const cleanWord = word.replace(/[.,!?]/g, '');
        const found = translationLookup[cleanWord];
        return found ? found.formal : word;
      });
      translation = translatedWords.join(' ');
      explanation = 'Deze vertaling geeft de formele Nederlandse betekenis van het straattaalwoord.';
      etymology = 'Veel straattaalwoorden hebben hun oorsprong in andere talen of zijn afgeleid van bestaande Nederlandse woorden.';
    }

    // Generate alternatives
    const recognizedWords = wordsToTranslate.filter(word => {
      const cleanWord = word.replace(/[.,!?]/g, '');
      return direction === 'to_slang' 
        ? Object.values(translationLookup).some(data => data.formal.toLowerCase().includes(cleanWord))
        : translationLookup[cleanWord];
    });

    if (recognizedWords.length > 0) {
      alternatives.push(translation + ' (database match)');
      alternatives.push(translation + ' (verified translation)');
      confidence = 0.9;
    } else {
      alternatives.push(translation + ' (fallback)');
      alternatives.push(translation + ' (contextual)');
      confidence = 0.3;
    }

    // Add specific explanation for recognized words
    const firstWord = wordsToTranslate[0]?.replace(/[.,!?]/g, '');
    if (firstWord && translationLookup[firstWord]) {
      explanation = translationLookup[firstWord].explanation;
    }

    console.log(`✅ Translation completed with confidence: ${confidence}`);

    return {
      translation,
      confidence,
      alternatives,
      explanation,
      etymology
    };

  } catch (error) {
    console.error('❌ Error in translation:', error);
    // Fallback to basic translation
    return {
      translation: text,
      confidence: 0.1,
      alternatives: [text + ' (fallback)'],
      explanation: 'Translation failed, using original text',
      etymology: 'Error occurred during translation'
    };
  }
}
