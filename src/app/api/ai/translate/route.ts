import { NextRequest, NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';

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

    // Use Supabase data for translation
    const translation = await generateTranslation(text, direction, context);

    return NextResponse.json(translation);
  } catch (error) {
    console.error('Error in AI translation:', error);
    return NextResponse.json({ error: 'Translation failed' }, { status: 500 });
  }
}

async function generateTranslation(
  text: string, 
  direction: 'to_slang' | 'to_formal', 
  _context?: string
): Promise<TranslationResponse> {
  try {
    console.log(`🔄 Translating: "${text}" (${direction})`);

    // Haal woorden op uit de database
    const { data: words, error } = await supabase
      .from('words')
      .select('word, definition, example, category')
      .eq('is_active', true);

    if (error) {
      console.error('❌ Error fetching words:', error);
      throw error;
    }

    // Maak lookup dictionaries
    const slangToFormal: Record<string, string> = {};
    const formalToSlang: Record<string, string> = {};

    words?.forEach(word => {
      slangToFormal[word.word.toLowerCase()] = word.definition;
      // Probeer formele woorden te matchen met slang
      const formalWords = word.definition.toLowerCase().split(/[,;]/);
      formalWords.forEach((formalWord: string) => {
        const cleanFormal = formalWord.trim();
        if (cleanFormal && !formalToSlang[cleanFormal]) {
          formalToSlang[cleanFormal] = word.word;
        }
      });
    });

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
        return formalToSlang[cleanWord] || word;
      });
      translation = translatedWords.join(' ');
      explanation = `Deze vertaling gebruikt moderne straattaal uit onze database van ${words?.length || 0} woorden.`;
      etymology = 'Straattaal ontwikkelt zich continu en wordt beïnvloed door verschillende culturen en media.';
    } else {
      // Translate slang to formal Dutch
      const translatedWords = wordsToTranslate.map(word => {
        const cleanWord = word.replace(/[.,!?]/g, '');
        return slangToFormal[cleanWord] || word;
      });
      translation = translatedWords.join(' ');
      explanation = `Deze vertaling geeft de formele Nederlandse betekenis van het straattaalwoord uit onze database.`;
      etymology = 'Veel straattaalwoorden hebben hun oorsprong in andere talen of zijn afgeleid van bestaande Nederlandse woorden.';
    }

    // Generate alternatives from database
    const recognizedWords = wordsToTranslate.filter(word => {
      const cleanWord = word.replace(/[.,!?]/g, '');
      return direction === 'to_slang' 
        ? formalToSlang[cleanWord] 
        : slangToFormal[cleanWord];
    });

    if (recognizedWords.length > 0) {
      alternatives.push(translation + ' (database match)');
      alternatives.push(translation + ' (verified translation)');
    } else {
      alternatives.push(translation + ' (fallback)');
      alternatives.push(translation + ' (contextual)');
    }

    // Adjust confidence based on word recognition
    confidence = Math.min(0.95, 0.3 + (recognizedWords.length / wordsToTranslate.length) * 0.6);

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
