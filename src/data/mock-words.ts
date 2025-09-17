/**
 * Mock words data for development and testing
 */

export interface MockWord {
  id: string;
  word: string;
  meaning: string;
  example: string;
  category?: string;
  difficulty?: 'easy' | 'medium' | 'hard';
}

export const mockWords: MockWord[] = [
  {
    id: '1',
    word: 'swag',
    meaning: 'stijl, cool, stoer',
    example: 'Die nieuwe outfit heeft echt swag!',
    category: 'stijl',
    difficulty: 'easy'
  },
  {
    id: '2',
    word: 'flexen',
    meaning: 'opscheppen, pronken',
    example: 'Hij flexte met zijn nieuwe auto.',
    category: 'gedrag',
    difficulty: 'easy'
  },
  {
    id: '3',
    word: 'skeer',
    meaning: 'arm, weinig geld hebben',
    example: 'Ik ben deze maand echt skeer.',
    category: 'geld',
    difficulty: 'easy'
  },
  {
    id: '4',
    word: 'breezy',
    meaning: 'cool, relaxed',
    example: 'Die nieuwe app is echt breezy.',
    category: 'stijl',
    difficulty: 'medium'
  },
  {
    id: '5',
    word: 'chill',
    meaning: 'relaxed, kalm',
    example: 'Laten we gewoon chillen vandaag.',
    category: 'gedrag',
    difficulty: 'easy'
  },
  {
    id: '6',
    word: 'dope',
    meaning: 'geweldig, cool',
    example: 'Die nieuwe track is echt dope!',
    category: 'stijl',
    difficulty: 'easy'
  },
  {
    id: '7',
    word: 'lit',
    meaning: 'geweldig, fantastisch',
    example: 'Het feest was echt lit!',
    category: 'stijl',
    difficulty: 'easy'
  },
  {
    id: '8',
    word: 'fire',
    meaning: 'geweldig, fantastisch',
    example: 'Die nieuwe sneakers zijn fire!',
    category: 'stijl',
    difficulty: 'easy'
  },
  {
    id: '9',
    word: 'vibe',
    meaning: 'sfeer, energie',
    example: 'De vibe hier is echt goed.',
    category: 'sfeer',
    difficulty: 'easy'
  },
  {
    id: '10',
    word: 'mood',
    meaning: 'stemming, gevoel',
    example: 'Ik ben echt in een goede mood vandaag.',
    category: 'gevoel',
    difficulty: 'easy'
  },
  {
    id: '11',
    word: 'goals',
    meaning: 'doelen, aspiraties',
    example: 'Die relatie is echt goals!',
    category: 'aspiraties',
    difficulty: 'easy'
  },
  {
    id: '12',
    word: 'salty',
    meaning: 'boos, gefrustreerd',
    example: 'Hij is echt salty omdat hij verloren heeft.',
    category: 'gevoel',
    difficulty: 'easy'
  },
  {
    id: '13',
    word: 'savage',
    meaning: 'brutaal, meedogenloos',
    example: 'Die comeback was echt savage!',
    category: 'gedrag',
    difficulty: 'medium'
  },
  {
    id: '14',
    word: 'cap',
    meaning: 'liegen, onzin vertellen',
    example: 'Hij capde over zijn nieuwe baan.',
    category: 'gedrag',
    difficulty: 'easy'
  },
  {
    id: '15',
    word: 'no cap',
    meaning: 'geen grap, serieus',
    example: 'No cap, dat was echt geweldig!',
    category: 'gedrag',
    difficulty: 'easy'
  },
  {
    id: '16',
    word: 'slay',
    meaning: 'geweldig doen, excelleren',
    example: 'Zij slayed die presentatie!',
    category: 'prestatie',
    difficulty: 'easy'
  },
  {
    id: '17',
    word: 'bet',
    meaning: 'oké, deal',
    example: 'Bet, laten we dat doen!',
    category: 'gedrag',
    difficulty: 'easy'
  },
  {
    id: '18',
    word: 'periodt',
    meaning: 'punt uit, einde discussie',
    example: 'Dat is gewoon zo, periodt!',
    category: 'gedrag',
    difficulty: 'medium'
  },
  {
    id: '19',
    word: 'snatched',
    meaning: 'perfect, geweldig',
    example: 'Die outfit is echt snatched!',
    category: 'stijl',
    difficulty: 'medium'
  },
  {
    id: '20',
    word: 'tea',
    meaning: 'roddel, nieuws',
    example: 'Spill the tea over wat er gisteren gebeurde!',
    category: 'communicatie',
    difficulty: 'easy'
  },
  {
    id: '21',
    word: 'yass',
    meaning: 'ja, geweldig',
    example: 'Yass, dat is precies wat ik wilde!',
    category: 'gevoel',
    difficulty: 'easy'
  },
  {
    id: '22',
    word: 'queen',
    meaning: 'koningin, geweldige vrouw',
    example: 'Zij is echt een queen!',
    category: 'persoon',
    difficulty: 'easy'
  },
  {
    id: '23',
    word: 'king',
    meaning: 'koning, geweldige man',
    example: 'Hij is echt een king!',
    category: 'persoon',
    difficulty: 'easy'
  },
  {
    id: '24',
    word: 'basic',
    meaning: 'saai, gewoon',
    example: 'Die outfit is echt basic.',
    category: 'stijl',
    difficulty: 'easy'
  },
  {
    id: '25',
    word: 'extra',
    meaning: 'overdreven, te veel',
    example: 'Hij is echt extra vandaag.',
    category: 'gedrag',
    difficulty: 'easy'
  },
  {
    id: '26',
    word: 'lowkey',
    meaning: 'stiekem, een beetje',
    example: 'Ik ben lowkey jaloers op zijn nieuwe auto.',
    category: 'gevoel',
    difficulty: 'medium'
  },
  {
    id: '27',
    word: 'highkey',
    meaning: 'openlijk, heel erg',
    example: 'Ik ben highkey trots op mijn prestatie.',
    category: 'gevoel',
    difficulty: 'medium'
  },
  {
    id: '28',
    word: 'stan',
    meaning: 'fan zijn van, steunen',
    example: 'Ik stan die artiest echt hard.',
    category: 'gedrag',
    difficulty: 'easy'
  },
  {
    id: '29',
    word: 'ship',
    meaning: 'een koppel steunen',
    example: 'Ik ship die twee echt hard!',
    category: 'relaties',
    difficulty: 'easy'
  },
  {
    id: '30',
    word: 'ghost',
    meaning: 'negeren, niet reageren',
    example: 'Hij ghoste me na onze date.',
    category: 'communicatie',
    difficulty: 'easy'
  },
  {
    id: '31',
    word: 'flex',
    meaning: 'opscheppen, pronken',
    example: 'Hij flexte met zijn nieuwe telefoon.',
    category: 'gedrag',
    difficulty: 'easy'
  },
  {
    id: '32',
    word: 'clout',
    meaning: 'aandacht, populariteit',
    example: 'Hij doet alles voor clout.',
    category: 'sociale media',
    difficulty: 'medium'
  },
  {
    id: '33',
    word: 'clout chaser',
    meaning: 'iemand die aandacht zoekt',
    example: 'Zij is echt een clout chaser.',
    category: 'sociale media',
    difficulty: 'hard'
  },
  {
    id: '34',
    word: 'thirsty',
    meaning: 'wanhopig, aandacht zoekend',
    example: 'Hij is echt thirsty voor likes.',
    category: 'sociale media',
    difficulty: 'medium'
  },
  {
    id: '35',
    word: 'woke',
    meaning: 'bewust, alert',
    example: 'Hij is echt woke over sociale problemen.',
    category: 'bewustzijn',
    difficulty: 'medium'
  },
  {
    id: '36',
    word: 'cancelled',
    meaning: 'afgekeurd, geboycot',
    example: 'Die artiest is echt cancelled.',
    category: 'sociale media',
    difficulty: 'medium'
  },
  {
    id: '37',
    word: 'sus',
    meaning: 'verdacht, sketchy',
    example: 'Die situatie is echt sus.',
    category: 'gevoel',
    difficulty: 'easy'
  },
  {
    id: '38',
    word: 'simp',
    meaning: 'iemand die te veel doet voor iemand',
    example: 'Hij simpt echt hard voor haar.',
    category: 'relaties',
    difficulty: 'medium'
  },
  {
    id: '39',
    word: 'noob',
    meaning: 'beginner, onervaren',
    example: 'Hij is echt een noob in dit spel.',
    category: 'gaming',
    difficulty: 'easy'
  },
  {
    id: '40',
    word: 'pro',
    meaning: 'professional, ervaren',
    example: 'Zij is echt een pro in dit vak.',
    category: 'prestatie',
    difficulty: 'easy'
  },
  {
    id: '41',
    word: 'op',
    meaning: 'overpowered, te sterk',
    example: 'Die character is echt op.',
    category: 'gaming',
    difficulty: 'easy'
  },
  {
    id: '42',
    word: 'nerf',
    meaning: 'zwakker maken',
    example: 'Ze moeten die weapon nerfen.',
    category: 'gaming',
    difficulty: 'medium'
  },
  {
    id: '43',
    word: 'buff',
    meaning: 'sterker maken',
    example: 'Ze hebben die character gebufft.',
    category: 'gaming',
    difficulty: 'medium'
  },
  {
    id: '44',
    word: 'glitch',
    meaning: 'fout, bug',
    example: 'Er is een glitch in het systeem.',
    category: 'technologie',
    difficulty: 'easy'
  },
  {
    id: '45',
    word: 'lag',
    meaning: 'vertraging, traagheid',
    example: 'De game heeft veel lag.',
    category: 'technologie',
    difficulty: 'easy'
  },
  {
    id: '46',
    word: 'afk',
    meaning: 'away from keyboard, niet aanwezig',
    example: 'Ik ben even afk.',
    category: 'gaming',
    difficulty: 'easy'
  },
  {
    id: '47',
    word: 'irl',
    meaning: 'in real life, in het echte leven',
    example: 'Irl is hij heel anders.',
    category: 'communicatie',
    difficulty: 'easy'
  },
  {
    id: '48',
    word: 'tbh',
    meaning: 'to be honest, eerlijk gezegd',
    example: 'Tbh, ik vind het niet leuk.',
    category: 'communicatie',
    difficulty: 'easy'
  },
  {
    id: '49',
    word: 'imo',
    meaning: 'in my opinion, naar mijn mening',
    example: 'Imo is dat niet waar.',
    category: 'communicatie',
    difficulty: 'easy'
  },
  {
    id: '50',
    word: 'fyi',
    meaning: 'for your information, ter informatie',
    example: 'Fyi, de meeting is verplaatst.',
    category: 'communicatie',
    difficulty: 'easy'
  },
  {
    id: '51',
    word: 'btw',
    meaning: 'by the way, trouwens',
    example: 'Btw, heb je die nieuwe film gezien?',
    category: 'communicatie',
    difficulty: 'easy'
  },
  {
    id: '52',
    word: 'lol',
    meaning: 'laughing out loud, hardop lachen',
    example: 'Lol, dat was echt grappig!',
    category: 'communicatie',
    difficulty: 'easy'
  },
  {
    id: '53',
    word: 'rofl',
    meaning: 'rolling on floor laughing, rollend van het lachen',
    example: 'Rofl, ik kan niet stoppen met lachen!',
    category: 'communicatie',
    difficulty: 'easy'
  },
  {
    id: '54',
    word: 'lmao',
    meaning: 'laughing my ass off, me kapot lachen',
    example: 'Lmao, dat was hilarisch!',
    category: 'communicatie',
    difficulty: 'easy'
  },
  {
    id: '55',
    word: 'omg',
    meaning: 'oh my god, oh mijn god',
    example: 'Omg, dat kan niet waar zijn!',
    category: 'communicatie',
    difficulty: 'easy'
  },
  {
    id: '56',
    word: 'wtf',
    meaning: 'what the fuck, wat de fuck',
    example: 'Wtf, hoe is dat mogelijk?',
    category: 'communicatie',
    difficulty: 'easy'
  },
  {
    id: '57',
    word: 'fml',
    meaning: 'fuck my life, verpest mijn leven',
    example: 'Fml, ik heb mijn telefoon laten vallen.',
    category: 'gevoel',
    difficulty: 'easy'
  },
  {
    id: '58',
    word: 'yolo',
    meaning: 'you only live once, je leeft maar één keer',
    example: 'Yolo, laten we het gewoon doen!',
    category: 'levensfilosofie',
    difficulty: 'easy'
  },
  {
    id: '59',
    word: 'fomo',
    meaning: 'fear of missing out, angst om iets te missen',
    example: 'Ik heb echt fomo over dat feest.',
    category: 'gevoel',
    difficulty: 'medium'
  },
  {
    id: '60',
    word: 'jomo',
    meaning: 'joy of missing out, plezier van iets missen',
    example: 'Ik heb echt jomo over die drukke avond.',
    category: 'gevoel',
    difficulty: 'medium'
  },
  {
    id: '61',
    word: 'waggi',
    meaning: 'auto, wagen',
    example: 'Mijn nieuwe waggi is echt sick!',
    category: 'vervoer',
    difficulty: 'easy'
  },
  {
    id: '62',
    word: 'bro',
    meaning: 'vriend, maat',
    example: 'Hey bro, hoe gaat het?',
    category: 'relaties',
    difficulty: 'easy'
  },
  {
    id: '63',
    word: 'sick',
    meaning: 'geweldig, cool',
    example: 'Die nieuwe track is echt sick!',
    category: 'stijl',
    difficulty: 'easy'
  },
  {
    id: '64',
    word: 'chillen',
    meaning: 'ontspannen, relaxen',
    example: 'Laten we gewoon chillen vandaag.',
    category: 'gedrag',
    difficulty: 'easy'
  },
  {
    id: '65',
    word: 'vibe check',
    meaning: 'sfeer controleren',
    example: 'Laten we een vibe check doen.',
    category: 'sfeer',
    difficulty: 'medium'
  }
];

// Service functions for words
export function searchWords(query: string, limit: number = 10): MockWord[] {
  const normalizedQuery = query.toLowerCase().trim();
  
  if (!normalizedQuery) return [];
  
  const results = mockWords.filter(word => 
    word.word.toLowerCase().includes(normalizedQuery) ||
    word.meaning.toLowerCase().includes(normalizedQuery) ||
    word.example.toLowerCase().includes(normalizedQuery)
  );
  
  // Sort by relevance (exact match first, then partial)
  results.sort((a, b) => {
    const aExact = a.word.toLowerCase() === normalizedQuery;
    const bExact = b.word.toLowerCase() === normalizedQuery;
    
    if (aExact && !bExact) return -1;
    if (!aExact && bExact) return 1;
    
    return 0;
  });
  
  return results.slice(0, limit);
}

export function getWordById(id: string): MockWord | undefined {
  return mockWords.find(word => word.id === id);
}

export function getWordsByCategory(category: string): MockWord[] {
  return mockWords.filter(word => word.category === category);
}

export function getWordsByDifficulty(difficulty: 'easy' | 'medium' | 'hard'): MockWord[] {
  return mockWords.filter(word => word.difficulty === difficulty);
}

export function getRandomWords(count: number = 5): MockWord[] {
  const shuffled = [...mockWords].sort(() => 0.5 - Math.random());
  return shuffled.slice(0, count);
}

export function getWordOfTheDay(): MockWord {
  const today = new Date();
  const dayOfYear = Math.floor((today.getTime() - new Date(today.getFullYear(), 0, 0).getTime()) / (1000 * 60 * 60 * 24));
  const index = dayOfYear % mockWords.length;
  return mockWords[index];
}

export function getWords(): MockWord[] {
  return mockWords;
}
