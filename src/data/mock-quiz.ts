/**
 * Mock quiz data for development and testing
 */

export interface MockQuizQuestion {
  id: string;
  word: string;
  question_text: string;
  correct_answer: string;
  wrong_answers: string[];
  difficulty: 'easy' | 'medium' | 'hard';
}

export const mockQuizQuestions: MockQuizQuestion[] = [
  {
    id: '1',
    word: 'swag',
    question_text: 'Wat betekent "swag" in straattaal?',
    correct_answer: 'stijl, cool, stoer',
    wrong_answers: ['arm, weinig geld', 'boos, gefrustreerd', 'liegen, onzin vertellen'],
    difficulty: 'easy'
  },
  {
    id: '2',
    word: 'flexen',
    question_text: 'Wat betekent "flexen" in straattaal?',
    correct_answer: 'opscheppen, pronken',
    wrong_answers: ['ontspannen, relaxen', 'negeren, niet reageren', 'geweldig doen, excelleren'],
    difficulty: 'easy'
  },
  {
    id: '3',
    word: 'skeer',
    question_text: 'Wat betekent "skeer" in straattaal?',
    correct_answer: 'arm, weinig geld hebben',
    wrong_answers: ['cool, relaxed', 'geweldig, fantastisch', 'boos, gefrustreerd'],
    difficulty: 'easy'
  },
  {
    id: '4',
    word: 'breezy',
    question_text: 'Wat betekent "breezy" in straattaal?',
    correct_answer: 'cool, relaxed',
    wrong_answers: ['arm, weinig geld', 'overdreven, te veel', 'verdacht, sketchy'],
    difficulty: 'medium'
  },
  {
    id: '5',
    word: 'chill',
    question_text: 'Wat betekent "chill" in straattaal?',
    correct_answer: 'relaxed, kalm',
    wrong_answers: ['geweldig, cool', 'boos, gefrustreerd', 'opscheppen, pronken'],
    difficulty: 'easy'
  },
  {
    id: '6',
    word: 'dope',
    question_text: 'Wat betekent "dope" in straattaal?',
    correct_answer: 'geweldig, cool',
    wrong_answers: ['arm, weinig geld', 'boos, gefrustreerd', 'liegen, onzin vertellen'],
    difficulty: 'easy'
  },
  {
    id: '7',
    word: 'lit',
    question_text: 'Wat betekent "lit" in straattaal?',
    correct_answer: 'geweldig, fantastisch',
    wrong_answers: ['arm, weinig geld', 'boos, gefrustreerd', 'liegen, onzin vertellen'],
    difficulty: 'easy'
  },
  {
    id: '8',
    word: 'fire',
    question_text: 'Wat betekent "fire" in straattaal?',
    correct_answer: 'geweldig, fantastisch',
    wrong_answers: ['arm, weinig geld', 'boos, gefrustreerd', 'liegen, onzin vertellen'],
    difficulty: 'easy'
  },
  {
    id: '9',
    word: 'vibe',
    question_text: 'Wat betekent "vibe" in straattaal?',
    correct_answer: 'sfeer, energie',
    wrong_answers: ['arm, weinig geld', 'boos, gefrustreerd', 'liegen, onzin vertellen'],
    difficulty: 'easy'
  },
  {
    id: '10',
    word: 'mood',
    question_text: 'Wat betekent "mood" in straattaal?',
    correct_answer: 'stemming, gevoel',
    wrong_answers: ['arm, weinig geld', 'boos, gefrustreerd', 'liegen, onzin vertellen'],
    difficulty: 'easy'
  },
  {
    id: '11',
    word: 'goals',
    question_text: 'Wat betekent "goals" in straattaal?',
    correct_answer: 'doelen, aspiraties',
    wrong_answers: ['arm, weinig geld', 'boos, gefrustreerd', 'liegen, onzin vertellen'],
    difficulty: 'easy'
  },
  {
    id: '12',
    word: 'salty',
    question_text: 'Wat betekent "salty" in straattaal?',
    correct_answer: 'boos, gefrustreerd',
    wrong_answers: ['arm, weinig geld', 'geweldig, cool', 'liegen, onzin vertellen'],
    difficulty: 'easy'
  },
  {
    id: '13',
    word: 'savage',
    question_text: 'Wat betekent "savage" in straattaal?',
    correct_answer: 'brutaal, meedogenloos',
    wrong_answers: ['arm, weinig geld', 'geweldig, cool', 'liegen, onzin vertellen'],
    difficulty: 'medium'
  },
  {
    id: '14',
    word: 'cap',
    question_text: 'Wat betekent "cap" in straattaal?',
    correct_answer: 'liegen, onzin vertellen',
    wrong_answers: ['arm, weinig geld', 'geweldig, cool', 'boos, gefrustreerd'],
    difficulty: 'easy'
  },
  {
    id: '15',
    word: 'no cap',
    question_text: 'Wat betekent "no cap" in straattaal?',
    correct_answer: 'geen grap, serieus',
    wrong_answers: ['arm, weinig geld', 'geweldig, cool', 'boos, gefrustreerd'],
    difficulty: 'easy'
  },
  {
    id: '16',
    word: 'slay',
    question_text: 'Wat betekent "slay" in straattaal?',
    correct_answer: 'geweldig doen, excelleren',
    wrong_answers: ['arm, weinig geld', 'boos, gefrustreerd', 'liegen, onzin vertellen'],
    difficulty: 'easy'
  },
  {
    id: '17',
    word: 'bet',
    question_text: 'Wat betekent "bet" in straattaal?',
    correct_answer: 'oké, deal',
    wrong_answers: ['arm, weinig geld', 'boos, gefrustreerd', 'liegen, onzin vertellen'],
    difficulty: 'easy'
  },
  {
    id: '18',
    word: 'periodt',
    question_text: 'Wat betekent "periodt" in straattaal?',
    correct_answer: 'punt uit, einde discussie',
    wrong_answers: ['arm, weinig geld', 'boos, gefrustreerd', 'liegen, onzin vertellen'],
    difficulty: 'medium'
  },
  {
    id: '19',
    word: 'snatched',
    question_text: 'Wat betekent "snatched" in straattaal?',
    correct_answer: 'perfect, geweldig',
    wrong_answers: ['arm, weinig geld', 'boos, gefrustreerd', 'liegen, onzin vertellen'],
    difficulty: 'medium'
  },
  {
    id: '20',
    word: 'tea',
    question_text: 'Wat betekent "tea" in straattaal?',
    correct_answer: 'roddel, nieuws',
    wrong_answers: ['arm, weinig geld', 'boos, gefrustreerd', 'liegen, onzin vertellen'],
    difficulty: 'easy'
  },
  {
    id: '21',
    word: 'yass',
    question_text: 'Wat betekent "yass" in straattaal?',
    correct_answer: 'ja, geweldig',
    wrong_answers: ['arm, weinig geld', 'boos, gefrustreerd', 'liegen, onzin vertellen'],
    difficulty: 'easy'
  },
  {
    id: '22',
    word: 'queen',
    question_text: 'Wat betekent "queen" in straattaal?',
    correct_answer: 'koningin, geweldige vrouw',
    wrong_answers: ['arm, weinig geld', 'boos, gefrustreerd', 'liegen, onzin vertellen'],
    difficulty: 'easy'
  },
  {
    id: '23',
    word: 'king',
    question_text: 'Wat betekent "king" in straattaal?',
    correct_answer: 'koning, geweldige man',
    wrong_answers: ['arm, weinig geld', 'boos, gefrustreerd', 'liegen, onzin vertellen'],
    difficulty: 'easy'
  },
  {
    id: '24',
    word: 'basic',
    question_text: 'Wat betekent "basic" in straattaal?',
    correct_answer: 'saai, gewoon',
    wrong_answers: ['arm, weinig geld', 'boos, gefrustreerd', 'liegen, onzin vertellen'],
    difficulty: 'easy'
  },
  {
    id: '25',
    word: 'extra',
    question_text: 'Wat betekent "extra" in straattaal?',
    correct_answer: 'overdreven, te veel',
    wrong_answers: ['arm, weinig geld', 'boos, gefrustreerd', 'liegen, onzin vertellen'],
    difficulty: 'easy'
  },
  {
    id: '26',
    word: 'lowkey',
    question_text: 'Wat betekent "lowkey" in straattaal?',
    correct_answer: 'stiekem, een beetje',
    wrong_answers: ['arm, weinig geld', 'boos, gefrustreerd', 'liegen, onzin vertellen'],
    difficulty: 'medium'
  },
  {
    id: '27',
    word: 'highkey',
    question_text: 'Wat betekent "highkey" in straattaal?',
    correct_answer: 'openlijk, heel erg',
    wrong_answers: ['arm, weinig geld', 'boos, gefrustreerd', 'liegen, onzin vertellen'],
    difficulty: 'medium'
  },
  {
    id: '28',
    word: 'stan',
    question_text: 'Wat betekent "stan" in straattaal?',
    correct_answer: 'fan zijn van, steunen',
    wrong_answers: ['arm, weinig geld', 'boos, gefrustreerd', 'liegen, onzin vertellen'],
    difficulty: 'easy'
  },
  {
    id: '29',
    word: 'ship',
    question_text: 'Wat betekent "ship" in straattaal?',
    correct_answer: 'een koppel steunen',
    wrong_answers: ['arm, weinig geld', 'boos, gefrustreerd', 'liegen, onzin vertellen'],
    difficulty: 'easy'
  },
  {
    id: '30',
    word: 'ghost',
    question_text: 'Wat betekent "ghost" in straattaal?',
    correct_answer: 'negeren, niet reageren',
    wrong_answers: ['arm, weinig geld', 'boos, gefrustreerd', 'liegen, onzin vertellen'],
    difficulty: 'easy'
  },
  {
    id: '31',
    word: 'flex',
    question_text: 'Wat betekent "flex" in straattaal?',
    correct_answer: 'opscheppen, pronken',
    wrong_answers: ['arm, weinig geld', 'boos, gefrustreerd', 'liegen, onzin vertellen'],
    difficulty: 'easy'
  },
  {
    id: '32',
    word: 'clout',
    question_text: 'Wat betekent "clout" in straattaal?',
    correct_answer: 'aandacht, populariteit',
    wrong_answers: ['arm, weinig geld', 'boos, gefrustreerd', 'liegen, onzin vertellen'],
    difficulty: 'medium'
  },
  {
    id: '33',
    word: 'clout chaser',
    question_text: 'Wat betekent "clout chaser" in straattaal?',
    correct_answer: 'iemand die aandacht zoekt',
    wrong_answers: ['arm, weinig geld', 'boos, gefrustreerd', 'liegen, onzin vertellen'],
    difficulty: 'hard'
  },
  {
    id: '34',
    word: 'thirsty',
    question_text: 'Wat betekent "thirsty" in straattaal?',
    correct_answer: 'wanhopig, aandacht zoekend',
    wrong_answers: ['arm, weinig geld', 'boos, gefrustreerd', 'liegen, onzin vertellen'],
    difficulty: 'medium'
  },
  {
    id: '35',
    word: 'woke',
    question_text: 'Wat betekent "woke" in straattaal?',
    correct_answer: 'bewust, alert',
    wrong_answers: ['arm, weinig geld', 'boos, gefrustreerd', 'liegen, onzin vertellen'],
    difficulty: 'medium'
  },
  {
    id: '36',
    word: 'cancelled',
    question_text: 'Wat betekent "cancelled" in straattaal?',
    correct_answer: 'afgekeurd, geboycot',
    wrong_answers: ['arm, weinig geld', 'boos, gefrustreerd', 'liegen, onzin vertellen'],
    difficulty: 'medium'
  },
  {
    id: '37',
    word: 'sus',
    question_text: 'Wat betekent "sus" in straattaal?',
    correct_answer: 'verdacht, sketchy',
    wrong_answers: ['arm, weinig geld', 'boos, gefrustreerd', 'liegen, onzin vertellen'],
    difficulty: 'easy'
  },
  {
    id: '38',
    word: 'simp',
    question_text: 'Wat betekent "simp" in straattaal?',
    correct_answer: 'iemand die te veel doet voor iemand',
    wrong_answers: ['arm, weinig geld', 'boos, gefrustreerd', 'liegen, onzin vertellen'],
    difficulty: 'medium'
  },
  {
    id: '39',
    word: 'noob',
    question_text: 'Wat betekent "noob" in straattaal?',
    correct_answer: 'beginner, onervaren',
    wrong_answers: ['arm, weinig geld', 'boos, gefrustreerd', 'liegen, onzin vertellen'],
    difficulty: 'easy'
  },
  {
    id: '40',
    word: 'pro',
    question_text: 'Wat betekent "pro" in straattaal?',
    correct_answer: 'professional, ervaren',
    wrong_answers: ['arm, weinig geld', 'boos, gefrustreerd', 'liegen, onzin vertellen'],
    difficulty: 'easy'
  },
  {
    id: '41',
    word: 'op',
    question_text: 'Wat betekent "op" in straattaal?',
    correct_answer: 'overpowered, te sterk',
    wrong_answers: ['arm, weinig geld', 'boos, gefrustreerd', 'liegen, onzin vertellen'],
    difficulty: 'easy'
  },
  {
    id: '42',
    word: 'nerf',
    question_text: 'Wat betekent "nerf" in straattaal?',
    correct_answer: 'zwakker maken',
    wrong_answers: ['arm, weinig geld', 'boos, gefrustreerd', 'liegen, onzin vertellen'],
    difficulty: 'medium'
  },
  {
    id: '43',
    word: 'buff',
    question_text: 'Wat betekent "buff" in straattaal?',
    correct_answer: 'sterker maken',
    wrong_answers: ['arm, weinig geld', 'boos, gefrustreerd', 'liegen, onzin vertellen'],
    difficulty: 'medium'
  },
  {
    id: '44',
    word: 'glitch',
    question_text: 'Wat betekent "glitch" in straattaal?',
    correct_answer: 'fout, bug',
    wrong_answers: ['arm, weinig geld', 'boos, gefrustreerd', 'liegen, onzin vertellen'],
    difficulty: 'easy'
  },
  {
    id: '45',
    word: 'lag',
    question_text: 'Wat betekent "lag" in straattaal?',
    correct_answer: 'vertraging, traagheid',
    wrong_answers: ['arm, weinig geld', 'boos, gefrustreerd', 'liegen, onzin vertellen'],
    difficulty: 'easy'
  },
  {
    id: '46',
    word: 'afk',
    question_text: 'Wat betekent "afk" in straattaal?',
    correct_answer: 'away from keyboard, niet aanwezig',
    wrong_answers: ['arm, weinig geld', 'boos, gefrustreerd', 'liegen, onzin vertellen'],
    difficulty: 'easy'
  },
  {
    id: '47',
    word: 'irl',
    question_text: 'Wat betekent "irl" in straattaal?',
    correct_answer: 'in real life, in het echte leven',
    wrong_answers: ['arm, weinig geld', 'boos, gefrustreerd', 'liegen, onzin vertellen'],
    difficulty: 'easy'
  },
  {
    id: '48',
    word: 'tbh',
    question_text: 'Wat betekent "tbh" in straattaal?',
    correct_answer: 'to be honest, eerlijk gezegd',
    wrong_answers: ['arm, weinig geld', 'boos, gefrustreerd', 'liegen, onzin vertellen'],
    difficulty: 'easy'
  },
  {
    id: '49',
    word: 'imo',
    question_text: 'Wat betekent "imo" in straattaal?',
    correct_answer: 'in my opinion, naar mijn mening',
    wrong_answers: ['arm, weinig geld', 'boos, gefrustreerd', 'liegen, onzin vertellen'],
    difficulty: 'easy'
  },
  {
    id: '50',
    word: 'fyi',
    question_text: 'Wat betekent "fyi" in straattaal?',
    correct_answer: 'for your information, ter informatie',
    wrong_answers: ['arm, weinig geld', 'boos, gefrustreerd', 'liegen, onzin vertellen'],
    difficulty: 'easy'
  }
];

// Service functions for quiz questions
export function getQuizQuestions(difficulty?: 'easy' | 'medium' | 'hard', limit: number = 10): MockQuizQuestion[] {
  let questions = mockQuizQuestions;
  
  if (difficulty) {
    questions = questions.filter(q => q.difficulty === difficulty);
  }
  
  // Shuffle and return limited number
  const shuffled = [...questions].sort(() => 0.5 - Math.random());
  return shuffled.slice(0, limit);
}

export function getQuizQuestionById(id: string): MockQuizQuestion | undefined {
  return mockQuizQuestions.find(q => q.id === id);
}

export function getRandomQuizQuestion(): MockQuizQuestion {
  const randomIndex = Math.floor(Math.random() * mockQuizQuestions.length);
  return mockQuizQuestions[randomIndex];
}

export function getQuizQuestionsByWord(word: string): MockQuizQuestion[] {
  return mockQuizQuestions.filter(q => q.word.toLowerCase() === word.toLowerCase());
}

export function getQuizQuestionsByDifficulty(difficulty: 'easy' | 'medium' | 'hard'): MockQuizQuestion[] {
  return mockQuizQuestions.filter(q => q.difficulty === difficulty);
}

export function getQuizStats(): { total: number; byDifficulty: Record<string, number> } {
  const byDifficulty = mockQuizQuestions.reduce((acc, q) => {
    acc[q.difficulty] = (acc[q.difficulty] || 0) + 1;
    return acc;
  }, {} as Record<string, number>);
  
  return {
    total: mockQuizQuestions.length,
    byDifficulty
  };
}
