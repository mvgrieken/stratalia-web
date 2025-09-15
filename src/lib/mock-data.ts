/**
 * Centralized mock data service
 * Provides fallback data for development and testing
 */

export interface MockWord {
  id: string;
  word: string;
  meaning: string;
  example: string;
  category?: string;
  difficulty?: 'easy' | 'medium' | 'hard';
}

export interface MockQuizQuestion {
  id: string;
  word: string;
  question_text: string;
  correct_answer: string;
  wrong_answers: string[];
  difficulty: 'easy' | 'medium' | 'hard';
}

export interface MockKnowledgeItem {
  id: string;
  title: string;
  content: string;
  type: 'article' | 'video' | 'podcast' | 'infographic';
  difficulty: 'beginner' | 'intermediate' | 'advanced';
  category: string;
  tags: string[];
  author: string;
  created_at: string;
  updated_at: string;
  is_active: boolean;
  thumbnail_url?: string;
  duration?: number;
  word_count?: number;
}

export interface MockLeaderboardUser {
  rank: number;
  user_id: string;
  full_name: string;
  total_points: number;
  current_level: number;
  current_streak: number;
  longest_streak: number;
  avatar_url?: string;
}

class MockDataService {
  private words: MockWord[] = [
    {
      id: 'mock-1',
      word: 'skeer',
      meaning: 'arm, weinig geld hebben',
      example: 'Ik ben helemaal skeer deze maand.',
      category: 'geld',
      difficulty: 'easy'
    },
    {
      id: 'mock-2',
      word: 'breezy',
      meaning: 'cool, relaxed',
      example: 'Die nieuwe sneakers zijn echt breezy.',
      category: 'positief',
      difficulty: 'easy'
    },
    {
      id: 'mock-3',
      word: 'flexen',
      meaning: 'opscheppen, pronken',
      example: 'Hij flexte met zijn nieuwe auto.',
      category: 'gedrag',
      difficulty: 'medium'
    },
    {
      id: 'mock-4',
      word: 'chill',
      meaning: 'relaxed, kalm',
      example: 'Laten we gewoon chillen vandaag.',
      category: 'positief',
      difficulty: 'easy'
    },
    {
      id: 'mock-5',
      word: 'swag',
      meaning: 'stijl, cool',
      example: 'Die outfit heeft echt swag.',
      category: 'positief',
      difficulty: 'easy'
    },
    {
      id: 'mock-6',
      word: 'dope',
      meaning: 'geweldig, cool',
      example: 'Die nieuwe track is echt dope.',
      category: 'positief',
      difficulty: 'medium'
    },
    {
      id: 'mock-7',
      word: 'lit',
      meaning: 'geweldig, fantastisch',
      example: 'Het feest was echt lit gisteren.',
      category: 'positief',
      difficulty: 'medium'
    },
    {
      id: 'mock-8',
      word: 'fire',
      meaning: 'geweldig, fantastisch',
      example: 'Die nieuwe sneakers zijn fire.',
      category: 'positief',
      difficulty: 'medium'
    },
    {
      id: 'mock-9',
      word: 'vibe',
      meaning: 'sfeer, energie',
      example: 'Ik hou van de vibe hier.',
      category: 'abstract',
      difficulty: 'medium'
    },
    {
      id: 'mock-10',
      word: 'mood',
      meaning: 'stemming, gevoel',
      example: 'Dit is echt mijn mood vandaag.',
      category: 'abstract',
      difficulty: 'easy'
    },
    {
      id: 'mock-11',
      word: 'goals',
      meaning: 'doelen, aspiraties',
      example: 'Jullie relatie is echt goals.',
      category: 'abstract',
      difficulty: 'medium'
    },
    {
      id: 'mock-12',
      word: 'salty',
      meaning: 'boos, gefrustreerd',
      example: 'Hij is salty omdat hij verloor.',
      category: 'negatief',
      difficulty: 'hard'
    },
    {
      id: 'mock-13',
      word: 'savage',
      meaning: 'brutaal, meedogenloos',
      example: 'Die comeback was echt savage.',
      category: 'gedrag',
      difficulty: 'hard'
    },
    {
      id: 'mock-14',
      word: 'cap',
      meaning: 'liegen, onzin vertellen',
      example: 'Dat is cap, dat geloof ik niet.',
      category: 'negatief',
      difficulty: 'hard'
    },
    {
      id: 'mock-15',
      word: 'no cap',
      meaning: 'geen grap, serieus',
      example: 'No cap, dat was echt geweldig.',
      category: 'positief',
      difficulty: 'hard'
    }
  ];

  private quizQuestions: MockQuizQuestion[] = [
    {
      id: 'quiz-1',
      word: 'skeer',
      question_text: 'Wat betekent het woord "skeer"?',
      correct_answer: 'arm, weinig geld hebben',
      wrong_answers: ['cool, relaxed', 'geweldig, fantastisch', 'boos, gefrustreerd'],
      difficulty: 'easy'
    },
    {
      id: 'quiz-2',
      word: 'breezy',
      question_text: 'Wat betekent het woord "breezy"?',
      correct_answer: 'cool, relaxed',
      wrong_answers: ['arm, weinig geld', 'opscheppen, pronken', 'geweldig, fantastisch'],
      difficulty: 'easy'
    },
    {
      id: 'quiz-3',
      word: 'flexen',
      question_text: 'Wat betekent het woord "flexen"?',
      correct_answer: 'opscheppen, pronken',
      wrong_answers: ['arm, weinig geld', 'cool, relaxed', 'geweldig, fantastisch'],
      difficulty: 'medium'
    },
    {
      id: 'quiz-4',
      word: 'dope',
      question_text: 'Wat betekent het woord "dope"?',
      correct_answer: 'geweldig, cool',
      wrong_answers: ['arm, weinig geld', 'opscheppen, pronken', 'boos, gefrustreerd'],
      difficulty: 'medium'
    },
    {
      id: 'quiz-5',
      word: 'lit',
      question_text: 'Wat betekent het woord "lit"?',
      correct_answer: 'geweldig, fantastisch',
      wrong_answers: ['arm, weinig geld', 'cool, relaxed', 'opscheppen, pronken'],
      difficulty: 'medium'
    },
    {
      id: 'quiz-6',
      word: 'fire',
      question_text: 'Wat betekent het woord "fire"?',
      correct_answer: 'geweldig, fantastisch',
      wrong_answers: ['arm, weinig geld', 'cool, relaxed', 'boos, gefrustreerd'],
      difficulty: 'hard'
    },
    {
      id: 'quiz-7',
      word: 'salty',
      question_text: 'Wat betekent het woord "salty"?',
      correct_answer: 'boos, gefrustreerd',
      wrong_answers: ['geweldig, fantastisch', 'cool, relaxed', 'opscheppen, pronken'],
      difficulty: 'hard'
    },
    {
      id: 'quiz-8',
      word: 'vibe',
      question_text: 'Wat betekent het woord "vibe"?',
      correct_answer: 'sfeer, energie',
      wrong_answers: ['arm, weinig geld', 'opscheppen, pronken', 'boos, gefrustreerd'],
      difficulty: 'easy'
    },
    {
      id: 'quiz-9',
      word: 'mood',
      question_text: 'Wat betekent het woord "mood"?',
      correct_answer: 'stemming, gevoel',
      wrong_answers: ['arm, weinig geld', 'cool, relaxed', 'opscheppen, pronken'],
      difficulty: 'easy'
    },
    {
      id: 'quiz-10',
      word: 'goals',
      question_text: 'Wat betekent het woord "goals"?',
      correct_answer: 'doelen, aspiraties',
      wrong_answers: ['arm, weinig geld', 'boos, gefrustreerd', 'opscheppen, pronken'],
      difficulty: 'medium'
    }
  ];

  private knowledgeItems: MockKnowledgeItem[] = [
    {
      id: 'knowledge-1',
      title: 'De Geschiedenis van Nederlandse Straattaal',
      content: 'Straattaal in Nederland heeft een rijke geschiedenis die teruggaat tot de jaren 80. Het ontstond in multiculturele wijken waar verschillende talen en culturen samenkwamen. Vandaag de dag is straattaal een integraal onderdeel van de Nederlandse jeugdcultuur.',
      type: 'article',
      difficulty: 'beginner',
      category: 'geschiedenis',
      tags: ['geschiedenis', 'cultuur', 'jeugd'],
      author: 'Stratalia Team',
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
      is_active: true,
      word_count: 150
    },
    {
      id: 'knowledge-2',
      title: 'Top 10 Meest Gebruikte Straattaalwoorden',
      content: 'Ontdek de meest populaire straattaalwoorden van dit moment: 1. Skeer - arm zijn, 2. Breezy - cool, relaxed, 3. Flexen - opscheppen, 4. Chill - ontspannen, 5. Dope - geweldig, 6. Lit - fantastisch, 7. Fire - geweldig, 8. Vibe - sfeer, 9. Mood - stemming, 10. Goals - doelen.',
      type: 'infographic',
      difficulty: 'beginner',
      category: 'woordenlijst',
      tags: ['top 10', 'populair', 'woorden'],
      author: 'Stratalia Team',
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
      is_active: true,
      word_count: 75
    },
    {
      id: 'knowledge-3',
      title: 'Straattaal in Social Media',
      content: 'Hoe straattaal zich verspreidt via Instagram, TikTok en andere platforms. Social media speelt een cruciale rol in de evolutie van straattaal, met nieuwe woorden die viral gaan en binnen dagen door miljoenen jongeren worden gebruikt.',
      type: 'article',
      difficulty: 'intermediate',
      category: 'social media',
      tags: ['social media', 'viral', 'trends'],
      author: 'Stratalia Team',
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
      is_active: true,
      word_count: 200
    },
    {
      id: 'knowledge-4',
      title: 'Podcast: Straattaal in de Muziek',
      content: 'Een diepgaande discussie over hoe Nederlandse rappers en artiesten straattaal gebruiken in hun muziek. Van de vroege hip-hop tot moderne trap, straattaal heeft altijd een belangrijke rol gespeeld in de Nederlandse muziekscene.',
      type: 'podcast',
      difficulty: 'intermediate',
      category: 'muziek',
      tags: ['muziek', 'rap', 'hip-hop', 'cultuur'],
      author: 'Stratalia Team',
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
      is_active: true,
      duration: 1800 // 30 minutes
    },
    {
      id: 'knowledge-5',
      title: 'Video: Hoe Spreek Je Straattaal Uit?',
      content: 'Een visuele gids voor de juiste uitspraak van populaire straattaalwoorden. Leer de subtiele verschillen in intonatie en accent die straattaal zo uniek maken.',
      type: 'video',
      difficulty: 'beginner',
      category: 'uitspraak',
      tags: ['uitspraak', 'video', 'leer'],
      author: 'Stratalia Team',
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
      is_active: true,
      duration: 300, // 5 minutes
      thumbnail_url: '/images/straattaal-uitspraak.jpg'
    },
    {
      id: 'knowledge-6',
      title: 'De Psychologie van Straattaal',
      content: 'Waarom gebruiken jongeren straattaal? Een psychologische analyse van de sociale functies van straattaal, inclusief groepsvorming, identiteit en rebellie tegen de gevestigde orde.',
      type: 'article',
      difficulty: 'advanced',
      category: 'psychologie',
      tags: ['psychologie', 'sociologie', 'identiteit'],
      author: 'Stratalia Team',
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
      is_active: true,
      word_count: 500
    }
  ];

  private leaderboardUsers: MockLeaderboardUser[] = [
    {
      rank: 1,
      user_id: 'demo-1',
      full_name: 'Alex van der Berg',
      total_points: 2450,
      current_level: 8,
      current_streak: 12,
      longest_streak: 25,
      avatar_url: '/avatars/alex.jpg'
    },
    {
      rank: 2,
      user_id: 'demo-2',
      full_name: 'Sofia Martinez',
      total_points: 2180,
      current_level: 7,
      current_streak: 8,
      longest_streak: 18,
      avatar_url: '/avatars/sofia.jpg'
    },
    {
      rank: 3,
      user_id: 'demo-3',
      full_name: 'Mohammed Hassan',
      total_points: 1950,
      current_level: 6,
      current_streak: 15,
      longest_streak: 22,
      avatar_url: '/avatars/mohammed.jpg'
    },
    {
      rank: 4,
      user_id: 'demo-4',
      full_name: 'Emma de Vries',
      total_points: 1720,
      current_level: 6,
      current_streak: 5,
      longest_streak: 12,
      avatar_url: '/avatars/emma.jpg'
    },
    {
      rank: 5,
      user_id: 'demo-5',
      full_name: 'Liam O\'Connor',
      total_points: 1580,
      current_level: 5,
      current_streak: 3,
      longest_streak: 8,
      avatar_url: '/avatars/liam.jpg'
    },
    {
      rank: 6,
      user_id: 'demo-6',
      full_name: 'Zara Ahmed',
      total_points: 1420,
      current_level: 5,
      current_streak: 7,
      longest_streak: 15,
      avatar_url: '/avatars/zara.jpg'
    },
    {
      rank: 7,
      user_id: 'demo-7',
      full_name: 'Noah van Dijk',
      total_points: 1280,
      current_level: 4,
      current_streak: 2,
      longest_streak: 6,
      avatar_url: '/avatars/noah.jpg'
    },
    {
      rank: 8,
      user_id: 'demo-8',
      full_name: 'Luna Rodriguez',
      total_points: 1150,
      current_level: 4,
      current_streak: 9,
      longest_streak: 14,
      avatar_url: '/avatars/luna.jpg'
    },
    {
      rank: 9,
      user_id: 'demo-9',
      full_name: 'Finn Bakker',
      total_points: 980,
      current_level: 3,
      current_streak: 4,
      longest_streak: 9,
      avatar_url: '/avatars/finn.jpg'
    },
    {
      rank: 10,
      user_id: 'demo-10',
      full_name: 'Maya Singh',
      total_points: 850,
      current_level: 3,
      current_streak: 1,
      longest_streak: 5,
      avatar_url: '/avatars/maya.jpg'
    }
  ];

  // Word methods
  getWords(): MockWord[] {
    return [...this.words];
  }

  searchWords(query: string, limit: number = 10): MockWord[] {
    const searchQuery = query.toLowerCase();
    return this.words
      .filter(word => 
        word.word.toLowerCase().includes(searchQuery) ||
        word.meaning.toLowerCase().includes(searchQuery)
      )
      .slice(0, limit);
  }

  getWordById(id: string): MockWord | undefined {
    return this.words.find(word => word.id === id);
  }

  getRandomWord(): MockWord {
    const randomIndex = Math.floor(Math.random() * this.words.length);
    return this.words[randomIndex];
  }

  getDailyWord(): MockWord {
    // Use day of month for consistent daily selection
    const dayOfMonth = new Date().getDate();
    return this.words[dayOfMonth % this.words.length];
  }

  // Quiz methods
  getQuizQuestions(difficulty?: 'easy' | 'medium' | 'hard', limit: number = 5): MockQuizQuestion[] {
    let questions = this.quizQuestions;
    
    if (difficulty) {
      questions = questions.filter(q => q.difficulty === difficulty);
    }
    
    return questions.slice(0, limit);
  }

  getQuizQuestionById(id: string): MockQuizQuestion | undefined {
    return this.quizQuestions.find(q => q.id === id);
  }

  // Knowledge methods
  getKnowledgeItems(
    type?: 'article' | 'video' | 'podcast' | 'infographic',
    difficulty?: 'beginner' | 'intermediate' | 'advanced',
    limit: number = 50
  ): MockKnowledgeItem[] {
    let items = this.knowledgeItems;
    
    if (type) {
      items = items.filter(item => item.type === type);
    }
    
    if (difficulty) {
      items = items.filter(item => item.difficulty === difficulty);
    }
    
    return items.slice(0, limit);
  }

  getKnowledgeItemById(id: string): MockKnowledgeItem | undefined {
    return this.knowledgeItems.find(item => item.id === id);
  }

  // Leaderboard methods
  getLeaderboard(limit: number = 10): MockLeaderboardUser[] {
    return this.leaderboardUsers.slice(0, limit);
  }

  getUserById(userId: string): MockLeaderboardUser | undefined {
    return this.leaderboardUsers.find(user => user.user_id === userId);
  }

  // Translation methods
  getTranslationMap(): Record<string, string> {
    const map: Record<string, string> = {};
    this.words.forEach(word => {
      map[word.word.toLowerCase()] = word.meaning;
    });
    return map;
  }

  getReverseTranslationMap(): Record<string, string> {
    const map: Record<string, string> = {};
    this.words.forEach(word => {
      // Split meaning and map each part
      const meanings = word.meaning.split(',').map(m => m.trim());
      meanings.forEach(meaning => {
        map[meaning.toLowerCase()] = word.word;
      });
    });
    return map;
  }
}

// Singleton instance
export const mockDataService = new MockDataService();
