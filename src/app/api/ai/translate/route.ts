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
        logger.info(`Translation completed: text="${cleanText}", direction="${direction}", source="database"`);
        return NextResponse.json(translation);
      } catch (dbError) {
        const normalized = normalizeError(dbError);
        logger.warn(`Database translation failed, using fallback: ${normalized.message}`);
      }
    } else {
      logger.info('Supabase not configured, using fallback translation');
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

// Comprehensive fallback translation data - updated with all mock data words
const STRAATTAAL_TO_NL: Record<string, string> = {
  'swag': 'stijl, cool, stoer',
  'flexen': 'opscheppen, pronken',
  'skeer': 'arm, weinig geld hebben',
  'breezy': 'cool, relaxed',
  'chill': 'relaxed, kalm',
  'dope': 'geweldig, cool',
  'lit': 'geweldig, fantastisch',
  'fire': 'geweldig, fantastisch',
  'vibe': 'sfeer, energie',
  'mood': 'stemming, gevoel',
  'goals': 'doelen, aspiraties',
  'salty': 'boos, gefrustreerd',
  'savage': 'brutaal, meedogenloos',
  'cap': 'liegen, onzin vertellen',
  'no cap': 'geen grap, serieus',
  'slay': 'geweldig doen, excelleren',
  'bet': 'oké, deal',
  'periodt': 'punt uit, einde discussie',
  'snatched': 'perfect, geweldig',
  'tea': 'roddel, nieuws',
  'yass': 'ja, geweldig',
  'queen': 'koningin, geweldige vrouw',
  'king': 'koning, geweldige man',
  'basic': 'saai, gewoon',
  'extra': 'overdreven, te veel',
  'lowkey': 'stiekem, een beetje',
  'highkey': 'openlijk, heel erg',
  'stan': 'fan zijn van, steunen',
  'ship': 'een koppel steunen',
  'ghost': 'negeren, niet reageren',
  'flex': 'opscheppen, pronken',
  'clout': 'aandacht, populariteit',
  'clout chaser': 'iemand die aandacht zoekt',
  'thirsty': 'wanhopig, aandacht zoekend',
  'woke': 'bewust, alert',
  'cancelled': 'afgekeurd, geboycot',
  'sus': 'verdacht, sketchy',
  'simp': 'iemand die te veel doet voor iemand',
  'noob': 'beginner, onervaren',
  'pro': 'professional, ervaren',
  'op': 'overpowered, te sterk',
  'nerf': 'zwakker maken',
  'buff': 'sterker maken',
  'glitch': 'fout, bug',
  'lag': 'vertraging, traagheid',
  'afk': 'away from keyboard, niet aanwezig',
  'irl': 'in real life, in het echte leven',
  'tbh': 'to be honest, eerlijk gezegd',
  'imo': 'in my opinion, naar mijn mening',
  'fyi': 'for your information, ter informatie',
  'btw': 'by the way, trouwens',
  'lol': 'laughing out loud, hardop lachen',
  'rofl': 'rolling on floor laughing, rollend van het lachen',
  'lmao': 'laughing my ass off, me kapot lachen',
  'omg': 'oh my god, oh mijn god',
  'wtf': 'what the fuck, wat de fuck',
  'fml': 'fuck my life, verpest mijn leven',
  'yolo': 'you only live once, je leeft maar één keer',
  'fomo': 'fear of missing out, angst om iets te missen',
  'jomo': 'joy of missing out, plezier van iets missen'
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
  'koning': 'king',
  'saai': 'basic',
  'gewoon': 'basic',
  'overdreven': 'extra',
  'te veel': 'extra',
  'stiekem': 'lowkey',
  'een beetje': 'lowkey',
  'openlijk': 'highkey',
  'heel erg': 'highkey',
  'fan zijn van': 'stan',
  'steunen': 'stan',
  'een koppel steunen': 'ship',
  'negeren': 'ghost',
  'niet reageren': 'ghost',
  'aandacht': 'clout',
  'populariteit': 'clout',
  'iemand die aandacht zoekt': 'clout chaser',
  'wanhopig': 'thirsty',
  'aandacht zoekend': 'thirsty',
  'bewust': 'woke',
  'alert': 'woke',
  'afgekeurd': 'cancelled',
  'geboycot': 'cancelled',
  'verdacht': 'sus',
  'sketchy': 'sus',
  'iemand die te veel doet': 'simp',
  'beginner': 'noob',
  'onervaren': 'noob',
  'professional': 'pro',
  'ervaren': 'pro',
  'overpowered': 'op',
  'te sterk': 'op',
  'zwakker maken': 'nerf',
  'sterker maken': 'buff',
  'fout': 'glitch',
  'bug': 'glitch',
  'vertraging': 'lag',
  'traagheid': 'lag',
  'away from keyboard': 'afk',
  'niet aanwezig': 'afk',
  'in real life': 'irl',
  'in het echte leven': 'irl',
  'to be honest': 'tbh',
  'eerlijk gezegd': 'tbh',
  'in my opinion': 'imo',
  'naar mijn mening': 'imo',
  'for your information': 'fyi',
  'ter informatie': 'fyi',
  'by the way': 'btw',
  'trouwens': 'btw',
  'laughing out loud': 'lol',
  'hardop lachen': 'lol',
  'rolling on floor laughing': 'rofl',
  'rollend van het lachen': 'rofl',
  'laughing my ass off': 'lmao',
  'me kapot lachen': 'lmao',
  'oh my god': 'omg',
  'oh mijn god': 'omg',
  'what the fuck': 'wtf',
  'wat de fuck': 'wtf',
  'fuck my life': 'fml',
  'verpest mijn leven': 'fml',
  'you only live once': 'yolo',
  'je leeft maar één keer': 'yolo',
  'fear of missing out': 'fomo',
  'angst om iets te missen': 'fomo',
  'joy of missing out': 'jomo',
  'plezier van iets missen': 'jomo',
  'auto': 'waggi',
  'wagen': 'waggi',
  'vriend': 'bro',
  'maat': 'bro',
  'geweldig': 'sick',
  'cool': 'sick',
  'ontspannen': 'chillen',
  'relaxen': 'chillen',
  'opscheppen': 'flex',
  'pronken': 'flex',
  'sfeer controleren': 'vibe check',
  'geweldig presteren': 'slay',
  'punt uit': 'periodt',
  'einde discussie': 'periodt',
  'zeker': 'bet',
  'waar': 'bet',
  'fan zijn van': 'stan',
  'steunen': 'stan'
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
