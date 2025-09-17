'use client';

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Navigation from '@/components/Navigation';
import DetailNavigation from './DetailNavigation';
import NotFoundState from './NotFoundState';

interface KnowledgeItem {
  id: string;
  type: 'article' | 'video' | 'podcast' | 'infographic';
  title: string;
  content: string;
  author: string;
  category: string;
  tags: string[];
  difficulty: 'beginner' | 'intermediate' | 'advanced';
  created_at: string;
  updated_at: string;
  is_active: boolean;
  thumbnail_url?: string;
  duration?: number;
  word_count?: number;
}

export default function KnowledgeDetailPage() {
  const params = useParams();
  const router = useRouter();
  const [item, setItem] = useState<KnowledgeItem | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchItem = async () => {
      if (!params?.id) {
        setError('Geen ID gevonden');
        setLoading(false);
        return;
      }

      try {
        setLoading(true);
        setError(null);

        // Try to fetch from API first
        const response = await fetch(`/api/content/approved/${params.id}`);
        
        if (response.ok) {
          const data = await response.json();
          if (data.success && data.data.item) {
            setItem(data.data.item);
            return;
          }
        }

        // Fallback to mock data (using real database IDs)
        const mockItems = [
          {
            id: 'fa845e60-d3c6-4136-bdf2-ebe750c2f1f7',
            title: 'Straattaal in Social Media',
            content: `Straattaal in Nederland heeft een rijke geschiedenis die teruggaat tot de jaren 80. Het ontstond in multiculturele wijken waar verschillende talen en culturen samenkwamen.

## De Oorsprong

In de jaren 80 begon straattaal zich te ontwikkelen in steden zoals Amsterdam, Rotterdam en Den Haag. Jongeren uit verschillende culturen creëerden een nieuwe manier van communiceren die hun identiteit weerspiegelde.

## Belangrijke Invloeden

- **Surinaams-Nederlands**: Veel woorden komen uit het Sranan Tongo
- **Engels**: Populaire muziek en films brachten Engelse termen
- **Arabisch**: Woorden uit het Marokkaans-Arabisch
- **Turks**: Invloeden uit de Turkse gemeenschap

## Moderne Ontwikkeling

Vandaag de dag is straattaal een integraal onderdeel van de Nederlandse jeugdcultuur. Het wordt gebruikt in:
- Sociale media
- Muziek en entertainment
- Dagelijks gesprek
- Online gaming

## De Toekomst

Straattaal blijft evolueren en nieuwe woorden worden constant toegevoegd. Het is een levende taal die de diversiteit van de Nederlandse samenleving weerspiegelt.`,
            type: 'article' as const,
            difficulty: 'beginner' as const,
            category: 'geschiedenis',
            tags: ['geschiedenis', 'cultuur', 'jeugd'],
            author: 'Stratalia Team',
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString(),
            is_active: true,
            word_count: 150
          },
          {
            id: 'd2c07aa3-aac1-4392-8234-9edb2601437a',
            title: 'Podcast: Straattaal in de Muziek',
            content: `Ontdek de meest populaire straattaalwoorden van dit moment:

## 1. Skeer
**Betekenis**: Arm zijn, weinig geld hebben
**Voorbeeld**: "Ik ben helemaal skeer deze maand."

## 2. Breezy
**Betekenis**: Cool, relaxed
**Voorbeeld**: "Die nieuwe sneakers zijn echt breezy."

## 3. Flexen
**Betekenis**: Opscheppen, pronken
**Voorbeeld**: "Hij flexte met zijn nieuwe auto."

## 4. Chill
**Betekenis**: Ontspannen, kalm
**Voorbeeld**: "Laten we gewoon chillen vandaag."

## 5. Dope
**Betekenis**: Geweldig, cool
**Voorbeeld**: "Die nieuwe track is echt dope."

## 6. Lit
**Betekenis**: Fantastisch, geweldig
**Voorbeeld**: "Het feest was echt lit gisteren."

## 7. Fire
**Betekenis**: Geweldig, fantastisch
**Voorbeeld**: "Die nieuwe sneakers zijn fire."

## 8. Vibe
**Betekenis**: Sfeer, energie
**Voorbeeld**: "Ik hou van de vibe hier."

## 9. Mood
**Betekenis**: Stemming, gevoel
**Voorbeeld**: "Dit is echt mijn mood vandaag."

## 10. Goals
**Betekenis**: Doelen, aspiraties
**Voorbeeld**: "Jullie relatie is echt goals."`,
            type: 'infographic' as const,
            difficulty: 'beginner' as const,
            category: 'woordenlijst',
            tags: ['top 10', 'populair', 'woorden'],
            author: 'Stratalia Team',
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString(),
            is_active: true,
            word_count: 75
          },
          {
            id: '6454db1f-8518-4bec-b693-043f9372e18a',
            title: 'Wat is Straattaal?',
            content: `Straattaal is een informele variant van het Nederlands die vooral wordt gebruikt door jongeren in stedelijke gebieden. Het is een dynamische taal die voortdurend evolueert en elementen bevat uit verschillende culturen en talen.

## Definitie

Straattaal is niet alleen een verzameling woorden, maar een complete communicatievorm die:
- Identiteit uitdrukt
- Groepsvorming bevordert
- Creativiteit stimuleert
- Culturele diversiteit weerspiegelt

## Kenmerken

- **Dynamisch**: Nieuwe woorden worden constant toegevoegd
- **Multicultureel**: Invloeden uit verschillende talen
- **Creatief**: Woorden worden op nieuwe manieren gebruikt
- **Generatiegebonden**: Vooral populair bij jongeren

## Waarom Straattaal?

Straattaal helpt jongeren om:
- Hun identiteit te vormen
- Bij een groep te horen
- Creatief te communiceren
- Hun culturele achtergrond te uiten`,
            type: 'article' as const,
            difficulty: 'beginner' as const,
            category: 'basis',
            tags: ['basis', 'introductie', 'definitie'],
            author: 'Stratalia Team',
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString(),
            is_active: true,
            word_count: 150
          }
        ];

        const foundItem = mockItems.find(i => i.id === params.id);
        if (foundItem) {
          setItem(foundItem);
        } else {
          setError('Item niet gevonden');
        }
      } catch (err) {
        console.error('Error fetching knowledge item:', err);
        setError('Er is een fout opgetreden bij het laden van het item');
      } finally {
        setLoading(false);
      }
    };

    fetchItem();
  }, [params?.id]);

  const getTypeIcon = (type: string) => {
    switch (type) {
      case 'article': return '📄';
      case 'video': return '🎥';
      case 'podcast': return '🎧';
      case 'book': return '📚';
      case 'music': return '🎵';
      default: return '📄';
    }
  };

  const getDifficultyColor = (difficulty: string) => {
    switch (difficulty) {
      case 'beginner': return 'bg-green-100 text-green-800';
      case 'intermediate': return 'bg-yellow-100 text-yellow-800';
      case 'advanced': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  if (loading) {
    return (
      <>
        <Navigation />
        <div className="min-h-screen bg-gray-50 flex items-center justify-center">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
            <p className="text-gray-600">Item wordt geladen...</p>
          </div>
        </div>
      </>
    );
  }

  if (error || !item) {
    return (
      <>
        <Navigation />
        <div className="min-h-screen bg-gray-50 flex items-center justify-center">
          <NotFoundState error={error} />
        </div>
      </>
    );
  }

  return (
    <>
      <Navigation />
      <div className="min-h-screen bg-gray-50">
        <div className="container mx-auto px-4 py-8">
          <div className="max-w-4xl mx-auto">
            {/* Breadcrumb */}
            <DetailNavigation 
              onBackToKnowledge={() => router.push('/knowledge')}
              onGoHome={() => router.push('/')}
            />
            <div className="text-sm text-gray-500 mb-6">
              <span className="text-gray-900">{item.title}</span>
            </div>

            {/* Article Header */}
            <div className="bg-white rounded-lg shadow-lg p-8 mb-8">
              <div className="flex items-center mb-4">
                <span className="text-3xl mr-3">{getTypeIcon(item.type)}</span>
                <span className={`px-3 py-1 rounded-full text-sm font-medium ${getDifficultyColor(item.difficulty)}`}>
                  {item.difficulty}
                </span>
              </div>

              <h1 className="text-3xl font-bold text-gray-900 mb-4">
                {item.title}
              </h1>

              <div className="flex items-center text-sm text-gray-500 mb-6">
                <span>👤 {item.author}</span>
                <span className="ml-4">📅 {new Date(item.created_at).getFullYear()}</span>
                {item.duration && <span className="ml-4">⏱️ {Math.floor(item.duration / 60)} min</span>}
                {item.word_count && <span className="ml-4">📝 {item.word_count} woorden</span>}
              </div>

              <div className="flex flex-wrap gap-2 mb-6">
                {item.tags.map((tag, index) => (
                  <span
                    key={index}
                    className="px-3 py-1 bg-blue-100 text-blue-600 text-sm rounded-full"
                  >
                    #{tag}
                  </span>
                ))}
              </div>
            </div>

            {/* Article Content */}
            <div className="bg-white rounded-lg shadow-lg p-8">
              <div className="prose prose-lg max-w-none">
                {item.type === 'article' || item.type === 'infographic' ? (
                  <div 
                    className="whitespace-pre-line"
                    dangerouslySetInnerHTML={{ 
                      __html: item.content.replace(/\n/g, '<br>').replace(/## /g, '<h2 class="text-2xl font-bold mt-6 mb-4">').replace(/# /g, '<h1 class="text-3xl font-bold mt-8 mb-6">').replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>').replace(/\*(.*?)\*/g, '<em>$1</em>')
                    }}
                  />
                ) : item.type === 'video' ? (
                  <div className="text-center">
                    <div className="bg-gray-100 rounded-lg p-12 mb-6">
                      <div className="text-6xl mb-4">🎥</div>
                      <p className="text-gray-600">Video content zou hier worden weergegeven</p>
                    </div>
                    <div className="text-left">
                      <p className="text-gray-700">{item.content}</p>
                    </div>
                  </div>
                ) : item.type === 'podcast' ? (
                  <div className="text-center">
                    <div className="bg-gray-100 rounded-lg p-12 mb-6">
                      <div className="text-6xl mb-4">🎧</div>
                      <p className="text-gray-600">Podcast audio zou hier worden weergegeven</p>
                    </div>
                    <div className="text-left">
                      <p className="text-gray-700">{item.content}</p>
                    </div>
                  </div>
                ) : (
                  <p className="text-gray-700">{item.content}</p>
                )}
              </div>
            </div>

            {/* Action Buttons */}
            <div className="mt-8 flex justify-between">
              <button
                onClick={() => router.push('/knowledge')}
                className="bg-gray-600 text-white px-6 py-3 rounded-lg hover:bg-gray-700"
              >
                ← Terug naar Kennisbank
              </button>
              <button
                onClick={() => router.push('/')}
                className="bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700"
              >
                Home
              </button>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
