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

        // Fallback to mock data (synchronized with knowledge page fallback)
        const mockItems = [
          {
            id: '0b012f34-1c42-4aea-8eae-b0165d4c0712',
            title: 'Welkom bij Stratalia',
            content: `Leer meer over Nederlandse straattaal en hoe je het kunt gebruiken. Deze kennisbank bevat artikelen, video's en podcasts over straattaal.

## Wat is Straattaal?

Straattaal is een informele variant van het Nederlands die vooral wordt gebruikt door jongeren in stedelijke gebieden. Het is een dynamische taal die voortdurend evolueert en elementen bevat uit verschillende culturen en talen.

## Waarom Straattaal Leren?

- **Identiteit**: Uitdrukken van je persoonlijkheid
- **Groepsvorming**: Bij een community horen
- **Creativiteit**: Nieuwe manieren van communiceren
- **Culturele diversiteit**: Verschillende achtergronden verbinden

## Hoe Gebruik Je Deze Kennisbank?

1. **Blader door artikelen** voor diepgaande informatie
2. **Bekijk video's** voor visuele uitleg
3. **Luister naar podcasts** voor gesprekken over straattaal
4. **Gebruik de zoekfunctie** om specifieke woorden te vinden

## Tips voor Beginners

- Start met veelgebruikte woorden zoals "skeer", "chill", "dope"
- Luister naar Nederlandse rap en hip-hop
- Praat met vrienden die straattaal gebruiken
- Wees niet bang om fouten te maken - straattaal is altijd in ontwikkeling!`,
            type: 'article' as const,
            difficulty: 'beginner' as const,
            category: 'introductie',
            tags: ['introductie', 'straattaal', 'leren'],
            author: 'Stratalia Team',
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString(),
            is_active: true,
            word_count: 50
          },
          {
            id: '1614551a-e197-42ff-ac1d-b7573f5cfd7f',
            title: 'Straattaal voor Beginners',
            content: `Een video introductie tot Nederlandse straattaal. Leer de basiswoorden en hoe je ze kunt gebruiken.

## Video Inhoud

Deze video behandelt:
- Basis straattaalwoorden
- Hoe je ze correct uitspreekt
- Wanneer je ze kunt gebruiken
- Veelgemaakte fouten

## Belangrijke Woorden

**Skeer** - Arm zijn, weinig geld hebben
**Chill** - Ontspannen, kalm
**Dope** - Geweldig, cool
**Lit** - Fantastisch, geweldig
**Fire** - Geweldig, fantastisch

## Tips

- Luister goed naar de uitspraak
- Oefen met vrienden
- Wees respectvol in je gebruik
- Begrijp de context voordat je woorden gebruikt`,
            type: 'video' as const,
            difficulty: 'beginner' as const,
            category: 'video',
            tags: ['video', 'beginners', 'introductie'],
            author: 'Stratalia Team',
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString(),
            is_active: true,
            duration: 300,
            thumbnail_url: 'https://images.unsplash.com/photo-1516321318423-f06f85e504b3?w=400&h=300&fit=crop'
          },
          {
            id: '6dd5b2b4-2c9c-48dc-b632-01d70de074a2',
            title: 'Straattaal Podcast',
            content: `Luister naar gesprekken over straattaal en cultuur. Experts delen hun kennis over de evolutie van straattaal.

## Podcast Inhoud

In deze aflevering:
- Geschiedenis van Nederlandse straattaal
- Invloeden uit verschillende culturen
- Hoe straattaal evolueert
- Toekomst van straattaal

## Gasten

- **Dr. Taalwetenschap** - Expert in Nederlandse straattaal
- **Rapper Lil Kleine** - Praktijkervaring met straattaal
- **Leraar Nederlands** - Onderwijs perspectief

## Belangrijke Thema's

- Multiculturele invloeden
- Generatieverschillen
- Sociale media impact
- Taal en identiteit`,
            type: 'podcast' as const,
            difficulty: 'intermediate' as const,
            category: 'podcast',
            tags: ['podcast', 'cultuur', 'experts'],
            author: 'Stratalia Team',
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString(),
            is_active: true,
            duration: 1800,
            thumbnail_url: 'https://images.unsplash.com/photo-1478737270239-2f02b77fc618?w=400&h=300&fit=crop'
          },
          {
            id: 'fa845e60-d3c6-4136-bdf2-ebe750c2f1f7',
            title: 'Straattaal in Social Media',
            content: `Ontdek hoe straattaal wordt gebruikt op sociale media platforms en wat de invloed is op de Nederlandse jeugdcultuur.

## Social Media Platforms

### Instagram
- **Stories**: Korte berichten met straattaal
- **Captions**: Beschrijvingen met populaire woorden
- **Comments**: Reacties in straattaal

### TikTok
- **Videos**: Creatieve content met straattaal
- **Hashtags**: Trending woorden en uitdrukkingen
- **Challenges**: Viral trends met straattaal

### Snapchat
- **Snaps**: Dagelijkse communicatie
- **Streaks**: Vriendschappen onderhouden
- **Filters**: Visuele expressie

## Populaire Woorden Online

- **Vibe** - Sfeer, energie
- **Mood** - Stemming, gevoel
- **Goals** - Doelen, aspiraties
- **Flex** - Opscheppen, pronken
- **No cap** - Geen grap, serieus

## Impact op Taal

Straattaal op sociale media:
- Verspreidt zich sneller
- Bereikt meer mensen
- Evolueert constant
- Beïnvloedt mainstream taal`,
            type: 'article' as const,
            difficulty: 'intermediate' as const,
            category: 'sociale-media',
            tags: ['sociale-media', 'jeugd', 'cultuur'],
            author: 'Stratalia Team',
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString(),
            is_active: true,
            word_count: 120,
            thumbnail_url: 'https://images.unsplash.com/photo-1611224923853-80b023f02d71?w=400&h=300&fit=crop'
          },
          {
            id: 'd2c07aa3-aac1-4392-8234-9edb2601437a',
            title: 'Top 10 Straattaalwoorden',
            content: `De meest populaire straattaalwoorden van dit moment. Van "skeer" tot "flexen" - leer de woorden die iedereen gebruikt.

## 1. Skeer
**Betekenis**: Arm zijn, weinig geld hebben
**Voorbeeld**: "Ik ben helemaal skeer deze maand."
**Gebruik**: Wanneer je weinig geld hebt

## 2. Breezy
**Betekenis**: Cool, relaxed
**Voorbeeld**: "Die nieuwe sneakers zijn echt breezy."
**Gebruik**: Om iets cools te beschrijven

## 3. Flexen
**Betekenis**: Opscheppen, pronken
**Voorbeeld**: "Hij flexte met zijn nieuwe auto."
**Gebruik**: Wanneer iemand opschept

## 4. Chill
**Betekenis**: Ontspannen, kalm
**Voorbeeld**: "Laten we gewoon chillen vandaag."
**Gebruik**: Om ontspanning aan te duiden

## 5. Dope
**Betekenis**: Geweldig, cool
**Voorbeeld**: "Die nieuwe track is echt dope."
**Gebruik**: Om iets geweldigs te beschrijven

## 6. Lit
**Betekenis**: Fantastisch, geweldig
**Voorbeeld**: "Het feest was echt lit gisteren."
**Gebruik**: Voor geweldige ervaringen

## 7. Fire
**Betekenis**: Geweldig, fantastisch
**Voorbeeld**: "Die nieuwe sneakers zijn fire."
**Gebruik**: Vergelijkbaar met "lit"

## 8. Vibe
**Betekenis**: Sfeer, energie
**Voorbeeld**: "Ik hou van de vibe hier."
**Gebruik**: Om sfeer te beschrijven

## 9. Mood
**Betekenis**: Stemming, gevoel
**Voorbeeld**: "Dit is echt mijn mood vandaag."
**Gebruik**: Om je gevoel uit te drukken

## 10. Goals
**Betekenis**: Doelen, aspiraties
**Voorbeeld**: "Jullie relatie is echt goals."
**Gebruik**: Om iets te bewonderen`,
            type: 'article' as const,
            difficulty: 'beginner' as const,
            category: 'woordenlijst',
            tags: ['top-10', 'populair', 'woorden'],
            author: 'Stratalia Team',
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString(),
            is_active: true,
            word_count: 75,
            thumbnail_url: 'https://images.unsplash.com/photo-1551288049-bebda4e38f71?w=400&h=300&fit=crop'
          },
          {
            id: '6454db1f-8518-4bec-b693-043f9372e18a',
            title: 'Straattaal Geschiedenis',
            content: `Een diepgaande analyse van de geschiedenis van Nederlandse straattaal. Van de jaren 80 tot nu.

## De Oorsprong (Jaren 80)

Straattaal ontstond in multiculturele wijken van grote steden:
- **Amsterdam**: Bijlmer, Zuidoost
- **Rotterdam**: Afrikaanderwijk, Delfshaven
- **Den Haag**: Schilderswijk, Transvaal

## Belangrijke Invloeden

### Surinaams-Nederlands
- **Sranan Tongo**: Basis voor veel woorden
- **Voorbeelden**: "brada" (broer), "sisa" (zus)

### Engels
- **Hip-hop cultuur**: Muziek en lifestyle
- **Voorbeelden**: "chill", "dope", "fire"

### Arabisch
- **Marokkaans-Arabisch**: Woorden uit de Maghreb
- **Voorbeelden**: "wallah" (echt waar), "habibi" (liefje)

### Turks
- **Turkse gemeenschap**: Invloeden uit Anatolië
- **Voorbeelden**: "lan" (hey), "abi" (broer)

## Moderne Ontwikkeling (2000-heden)

### Sociale Media Impact
- **Snapchat**: Nieuwe woorden verspreiden
- **Instagram**: Visuele straattaal
- **TikTok**: Viral trends

### Muziek Invloed
- **Nederlandse rap**: Lil Kleine, Boef, Sevn Alias
- **Hip-hop**: Internationale invloeden
- **Pop**: Mainstream acceptatie

## Toekomst van Straattaal

Straattaal blijft evolueren:
- Nieuwe woorden worden constant toegevoegd
- Internationale invloeden blijven groeien
- Technologie beïnvloedt taalontwikkeling
- Generatieverschillen blijven bestaan`,
            type: 'article' as const,
            difficulty: 'advanced' as const,
            category: 'geschiedenis',
            tags: ['geschiedenis', 'onderzoek', 'academisch'],
            author: 'Dr. Taalwetenschap',
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString(),
            is_active: true,
            word_count: 200,
            thumbnail_url: 'https://images.unsplash.com/photo-1481627834876-b7833e8f5570?w=400&h=300&fit=crop'
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
