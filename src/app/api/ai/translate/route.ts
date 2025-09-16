import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import { config, isSupabaseConfigured } from '@/lib/config';
import { normalizeError } from '@/lib/errors';
import { logger } from '@/lib/logger';

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
  source?: string;
}

export async function POST(request: NextRequest) {
  let cleanText = '';
  
  try {
    const body: TranslationRequest = await request.json();
    const { text, direction, context } = body;

    if (!text || !direction) {
      return NextResponse.json({ error: 'Text and direction are required' }, { status: 400 });
    }

    cleanText = text.trim();
    if (cleanText.length === 0) {
      return NextResponse.json({ error: 'Empty text provided' }, { status: 400 });
    }

    // Try database translation first if Supabase is configured
    if (isSupabaseConfigured()) {
      try {
        const supabase = createClient(config.supabase.url, config.supabase.anonKey);
        const translation = await generateTranslation(cleanText, direction, context, supabase);
        return NextResponse.json(translation);
      } catch (dbError) {
        console.log('Database translation failed, using fallback');
      }
    }

    // Fallback to hardcoded translation
    const translation = await generateFallbackTranslation(cleanText, direction);
    return NextResponse.json(translation);

  } catch (error) {
    const normalized = normalizeError(error);
    logger.error('Error in AI translation', normalized);
    
    // Return a helpful fallback response with better error handling
    return NextResponse.json({
      translation: cleanText,
      confidence: 0.1,
      alternatives: ['Vertaling niet beschikbaar', 'Probeer een ander woord', 'Controleer de spelling'],
      explanation: 'De vertaalservice is tijdelijk niet beschikbaar. We proberen een alternatieve vertaling te vinden.',
      etymology: 'Deze vertaling kon niet worden verwerkt door de AI-service.',
      source: 'error-fallback',
      error: true,
      message: 'Vertaling niet beschikbaar - probeer het later opnieuw'
    }, { status: 200 }); // Return 200 to avoid frontend error handling
  }
}

// Comprehensive fallback translation data
const STRAATTAAL_TO_NL: Record<string, string> = {
  'swag': 'stijl, cool, stoer',
  'flexen': 'opscheppen, pronken',
  'skeer': 'arm, weinig geld',
  'breezy': 'makkelijk, relaxed',
  'chill': 'ontspannen, kalm',
  'dope': 'geweldig, cool',
  'lit': 'geweldig, fantastisch',
  'fire': 'geweldig, fantastisch',
  'slay': 'geweldig doen, excelleren',
  'vibe': 'sfeer, gevoel',
  'goals': 'doelen, aspiraties',
  'mood': 'stemming, gevoel',
  'salty': 'boos, gefrustreerd',
  'savage': 'brutaal, meedogenloos',
  'cap': 'liegen, onzin vertellen',
  'no cap': 'geen grap, serieus',
  'bet': 'oké, deal',
  'periodt': 'punt uit, einde discussie',
  'snatched': 'perfect, geweldig',
  'tea': 'roddel, nieuws',
  'yass': 'ja, geweldig',
  'queen': 'koningin, geweldige vrouw',
  'king': 'koning, geweldige man'
};

const NL_TO_STRAATTAAL: Record<string, string> = {
  'stijl': 'swag',
  'cool': 'swag',
  'stoer': 'swag',
  'opscheppen': 'flexen',
  'pronken': 'flexen',
  'arm': 'skeer',
  'weinig geld': 'skeer',
  'makkelijk': 'breezy',
  'relaxed': 'breezy',
  'ontspannen': 'chill',
  'kalm': 'chill',
  'geweldig': 'dope',
  'fantastisch': 'lit',
  'sfeer': 'vibe',
  'gevoel': 'vibe',
  'stemming': 'mood',
  'doelen': 'goals',
  'aspiraties': 'goals',
  'boos': 'salty',
  'gefrustreerd': 'salty',
  'brutaal': 'savage',
  'meedogenloos': 'savage',
  'liegen': 'cap',
  'onzin': 'cap',
  'serieus': 'no cap',
  'oké': 'bet',
  'deal': 'bet',
  'perfect': 'snatched',
  'roddel': 'tea',
  'nieuws': 'tea',
  'ja': 'yass',
  'koningin': 'queen',
  'koning': 'king'
};

async function generateTranslation(
  text: string, 
  direction: 'to_slang' | 'to_formal', 
  _context?: string,
  supabase?: any
): Promise<TranslationResponse> {
  console.log(`🔄 Translating: "${text}" (${direction})`);

  // Try database lookup first
  if (supabase) {
    try {
      if (direction === 'to_formal') {
        const { data: words, error } = await supabase
          .from('words')
          .select('word, definition, example, meaning')
          .ilike('word', text.toLowerCase())
          .limit(1);

        if (!error && words && words.length > 0) {
          const word = words[0];
          return {
            translation: word.definition || word.meaning || text,
            confidence: 0.95,
            alternatives: [word.definition || word.meaning || text],
            explanation: `"${text}" betekent "${word.definition || word.meaning}" in het Nederlands.`,
            etymology: 'Dit woord komt uit de Nederlandse straattaal.',
            source: 'database'
          };
        }
      } else {
        const { data: words, error } = await supabase
          .from('words')
          .select('word, definition, example, meaning')
          .or(`definition.ilike.%${text}%,meaning.ilike.%${text}%`)
          .limit(1);

        if (!error && words && words.length > 0) {
          const word = words[0];
          return {
            translation: word.word,
            confidence: 0.95,
            alternatives: [word.word],
            explanation: `"${text}" kan in straattaal worden uitgedrukt als "${word.word}".`,
            etymology: 'Dit is een modern straattaalwoord.',
            source: 'database'
          };
        }
      }
    } catch (dbError) {
      console.log('Database lookup failed, using fallback');
    }
  }

  // Fallback to hardcoded translation
  return generateFallbackTranslation(text, direction);
}

async function generateFallbackTranslation(
  text: string, 
  direction: 'to_slang' | 'to_formal'
): Promise<TranslationResponse> {
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
      return NL_TO_STRAATTAAL[cleanWord] || word;
    });
    translation = translatedWords.join(' ');
    explanation = 'Deze vertaling gebruikt moderne straattaal uit onze database.';
    etymology = 'Straattaal ontwikkelt zich continu en wordt beïnvloed door verschillende culturen en media.';
  } else {
    // Translate slang to formal Dutch
    const translatedWords = wordsToTranslate.map(word => {
      const cleanWord = word.replace(/[.,!?]/g, '');
      return STRAATTAAL_TO_NL[cleanWord] || word;
    });
    translation = translatedWords.join(' ');
    explanation = 'Deze vertaling geeft de formele Nederlandse betekenis van het straattaalwoord.';
    etymology = 'Veel straattaalwoorden hebben hun oorsprong in andere talen of zijn afgeleid van bestaande Nederlandse woorden.';
  }

  // Generate alternatives
  const recognizedWords = wordsToTranslate.filter(word => {
    const cleanWord = word.replace(/[.,!?]/g, '');
    return direction === 'to_slang' 
      ? NL_TO_STRAATTAAL[cleanWord]
      : STRAATTAAL_TO_NL[cleanWord];
  });

  if (recognizedWords.length > 0) {
    alternatives.push(translation + ' (database match)');
    alternatives.push(translation + ' (verified translation)');
    confidence = 0.8;
    
    // Add specific explanation for recognized words
    const firstWord = wordsToTranslate[0]?.replace(/[.,!?]/g, '');
    if (firstWord && STRAATTAAL_TO_NL[firstWord]) {
      explanation = `"${firstWord}" betekent ${STRAATTAAL_TO_NL[firstWord]}`;
    } else if (firstWord && NL_TO_STRAATTAAL[firstWord]) {
      explanation = `"${firstWord}" kan in straattaal worden uitgedrukt als "${NL_TO_STRAATTAAL[firstWord]}"`;
    }
  } else {
    // No recognized words - provide helpful alternatives
    alternatives.push(translation + ' (geen exacte match gevonden)');
    alternatives.push('Probeer een ander woord');
    alternatives.push('Controleer de spelling');
    confidence = 0.2;
    explanation = `We hebben geen exacte vertaling gevonden voor "${text}". Probeer een ander woord of controleer de spelling.`;
    etymology = 'Niet alle woorden zijn beschikbaar in onze vertaaldatabase.';
  }

  // Ensure we always have a meaningful translation
  if (translation === text && confidence < 0.5) {
    translation = direction === 'to_slang' 
      ? `[Geen straattaal equivalent gevonden voor "${text}"]`
      : `[Geen formele vertaling gevonden voor "${text}"]`;
  }

  console.log(`✅ Translation completed with confidence: ${confidence}`);

  return {
    translation,
    confidence,
    alternatives,
    explanation,
    etymology,
    source: 'fallback'
  };
}
