import { NextRequest, NextResponse } from 'next/server';

// Mock data for demonstration
const mockWords = [
  {
    id: '1',
    word: 'skeer',
    meaning: 'arm, weinig geld hebben',
    example: 'Ik ben echt skeer deze maand.',
    match_type: 'exact',
    similarity_score: 1.0
  },
  {
    id: '2',
    word: 'breezy',
    meaning: 'cool, relaxed',
    example: 'Die nieuwe sneakers zijn echt breezy.',
    match_type: 'exact',
    similarity_score: 1.0
  },
  {
    id: '3',
    word: 'chillen',
    meaning: 'ontspannen, relaxen',
    example: 'Laten we gewoon chillen vandaag.',
    match_type: 'exact',
    similarity_score: 1.0
  },
  {
    id: '4',
    word: 'flexen',
    meaning: 'opscheppen, pronken',
    example: 'Hij flexte met zijn nieuwe auto.',
    match_type: 'exact',
    similarity_score: 1.0
  },
  {
    id: '5',
    word: 'dope',
    meaning: 'geweldig, cool',
    example: 'Die beat is echt dope!',
    match_type: 'exact',
    similarity_score: 1.0
  }
];

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const query = searchParams.get('query');
    const limit = parseInt(searchParams.get('limit') || '10');

    if (!query) {
      return NextResponse.json({ error: 'Query parameter is required' }, { status: 400 });
    }

    // Simple mock search - filter words that contain the query
    const results = mockWords
      .filter(word => 
        word.word.toLowerCase().includes(query.toLowerCase()) ||
        word.meaning.toLowerCase().includes(query.toLowerCase())
      )
      .slice(0, limit);

    return NextResponse.json(results);
  } catch (error) {
    console.error('Error in search API:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
