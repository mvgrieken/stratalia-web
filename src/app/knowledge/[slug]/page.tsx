'use client';

import { useState, useEffect, Suspense } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import { getSupabaseServiceClient } from '@/lib/supabase-client';
import { isSupabaseConfigured } from '@/lib/config';
import { getKnowledgeItemById } from '@/lib/mock-data';
import LoadingSpinner from '@/components/LoadingSpinner';
import ErrorMessage from '@/components/ErrorMessage';
import OptimizedImage from '@/components/OptimizedImage';

interface KnowledgeItem {
  id: string;
  title: string;
  content: string;
  author: string;
  type: 'article' | 'video' | 'podcast' | 'infographic' | 'book' | 'music';
  difficulty: 'beginner' | 'intermediate' | 'advanced';
  category: string;
  tags: string[];
  created_at: string;
  updated_at: string;
  thumbnail_url?: string;
  video_url?: string;
  audio_url?: string;
  duration?: string;
  word_count?: number;
  rating?: number;
  views?: number;
}

interface RelatedItem {
  id: string;
  title: string;
  type: string;
  difficulty: string;
  thumbnail_url?: string;
}

function KnowledgeDetailContent() {
  const params = useParams();
  const router = useRouter();
  const slug = params.slug as string;
  
  const [item, setItem] = useState<KnowledgeItem | null>(null);
  const [relatedItems, setRelatedItems] = useState<RelatedItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function loadKnowledgeItem() {
      if (!slug) return;
      
      setLoading(true);
      setError(null);

      try {
        let knowledgeItem: KnowledgeItem | null = null;
        
        if (isSupabaseConfigured()) {
          // Try to load from Supabase first
          const supabase = getSupabaseServiceClient();
          const { data, error: dbError } = await supabase
            .from('knowledge_items')
            .select('*')
            .eq('id', slug)
            .eq('is_active', true)
            .single();

          if (dbError) {
            console.warn('Failed to load from database, using fallback:', dbError);
          } else if (data) {
            knowledgeItem = {
              id: data.id,
              title: data.title,
              content: data.content,
              author: data.author || 'Onbekend',
              type: data.type,
              difficulty: data.difficulty,
              category: data.category,
              tags: data.tags || [],
              created_at: data.created_at,
              updated_at: data.updated_at,
              thumbnail_url: data.thumbnail_url,
              video_url: data.video_url,
              audio_url: data.audio_url,
              duration: data.duration,
              word_count: data.word_count,
              rating: data.rating,
              views: data.views
            };

            // Update view count
            await supabase
              .from('knowledge_items')
              .update({ views: (data.views || 0) + 1 })
              .eq('id', slug);
          }
        }
        
        // Fallback to mock data if Supabase failed or not configured
        if (!knowledgeItem) {
          const mockItem = getKnowledgeItemById(slug);
          if (mockItem) {
            knowledgeItem = {
              id: mockItem.id,
              title: mockItem.title,
              content: mockItem.content,
              author: mockItem.author,
              type: mockItem.type,
              difficulty: mockItem.difficulty,
              category: mockItem.category,
              tags: mockItem.tags,
              created_at: mockItem.created_at,
              updated_at: mockItem.updated_at,
              thumbnail_url: mockItem.thumbnail_url,
              video_url: mockItem.video_url,
              audio_url: mockItem.audio_url,
              duration: mockItem.duration,
              word_count: mockItem.word_count,
              rating: mockItem.rating,
              views: mockItem.views
            };
          }
        }

        if (!knowledgeItem) {
          setError('Kennisbank item niet gevonden');
          return;
        }

        setItem(knowledgeItem);

        // Load related items
        await loadRelatedItems(knowledgeItem.category, knowledgeItem.tags, knowledgeItem.id);

      } catch (err) {
        console.error('Error loading knowledge item:', err);
        setError('Er is een fout opgetreden bij het laden van dit item');
      } finally {
        setLoading(false);
      }
    }

    async function loadRelatedItems(category: string, tags: string[], currentId: string) {
      try {
        let related: RelatedItem[] = [];
        
        if (isSupabaseConfigured()) {
          const supabase = getSupabaseServiceClient();
          const { data } = await supabase
            .from('knowledge_items')
            .select('id, title, type, difficulty, thumbnail_url')
            .eq('is_active', true)
            .neq('id', currentId)
            .or(`category.eq.${category},tags.cs.{${tags.join(',')}}`)
            .order('views', { ascending: false })
            .limit(4);
          
          if (data) {
            related = data.map(item => ({
              id: item.id,
              title: item.title,
              type: item.type,
              difficulty: item.difficulty,
              thumbnail_url: item.thumbnail_url
            }));
          }
        }
        
        // Fallback to mock data if needed
        if (related.length === 0) {
          const { getKnowledgeItemsByCategory } = await import('@/lib/mock-data');
          const mockRelated = getKnowledgeItemsByCategory(category)
            .filter(item => item.id !== currentId)
            .slice(0, 4);
          
          related = mockRelated.map(item => ({
            id: item.id,
            title: item.title,
            type: item.type,
            difficulty: item.difficulty,
            thumbnail_url: item.thumbnail_url
          }));
        }
        
        setRelatedItems(related);
      } catch (err) {
        console.error('Error loading related items:', err);
      }
    }

    loadKnowledgeItem();
  }, [slug]);

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 py-8">
        <div className="max-w-4xl mx-auto px-6">
          <div className="animate-pulse">
            <div className="h-8 bg-gray-300 dark:bg-gray-600 rounded mb-4"></div>
            <div className="h-4 bg-gray-300 dark:bg-gray-600 rounded mb-2"></div>
            <div className="h-4 bg-gray-300 dark:bg-gray-600 rounded mb-8"></div>
            <div className="h-64 bg-gray-300 dark:bg-gray-600 rounded"></div>
          </div>
        </div>
      </div>
    );
  }

  if (error || !item) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 py-8">
        <div className="max-w-4xl mx-auto px-6">
          <ErrorMessage 
            title="Item niet gevonden"
            message={error || 'Dit kennisbank item bestaat niet of is niet beschikbaar.'}
          />
          <div className="mt-6">
            <Link 
              href="/knowledge"
              className="inline-flex items-center text-blue-600 dark:text-blue-400 hover:text-blue-800 dark:hover:text-blue-300"
            >
              ← Terug naar kennisbank
            </Link>
          </div>
        </div>
      </div>
    );
  }

  const getDifficultyColor = (difficulty: string) => {
    switch (difficulty) {
      case 'beginner': return 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200';
      case 'intermediate': return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200';
      case 'advanced': return 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200';
      default: return 'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-200';
    }
  };

  const getTypeIcon = (type: string) => {
    switch (type) {
      case 'video': return '🎥';
      case 'podcast': return '🎧';
      case 'article': return '📄';
      case 'book': return '📚';
      case 'music': return '🎵';
      case 'infographic': return '📊';
      default: return '📄';
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 py-8">
      <div className="max-w-4xl mx-auto px-6">
        {/* Navigation */}
        <nav className="mb-6" aria-label="Breadcrumb">
          <Link 
            href="/knowledge"
            className="inline-flex items-center text-blue-600 dark:text-blue-400 hover:text-blue-800 dark:hover:text-blue-300 focus:outline-none focus:ring-2 focus:ring-blue-500 rounded-sm"
            aria-label="Terug naar kennisbank overzicht"
          >
            <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
            Terug naar kennisbank
          </Link>
        </nav>

        {/* Article Header */}
        <header className="mb-8">
          <div className="flex items-center gap-2 mb-4">
            <span className="text-2xl" role="img" aria-label={`Type: ${item.type}`}>
              {getTypeIcon(item.type)}
            </span>
            <span className={`px-3 py-1 rounded-full text-sm font-medium ${getDifficultyColor(item.difficulty)}`}>
              {item.difficulty}
            </span>
            <span className="px-3 py-1 bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200 rounded-full text-sm font-medium">
              {item.category}
            </span>
          </div>
          
          <h1 className="text-3xl font-bold text-gray-900 dark:text-gray-100 mb-4">
            {item.title}
          </h1>
          
          <div className="flex items-center gap-4 text-sm text-gray-600 dark:text-gray-400 mb-6">
            <span>Door: <strong>{item.author}</strong></span>
            {item.duration && <span>Duur: {item.duration}</span>}
            {item.word_count && <span>{item.word_count} woorden</span>}
            {item.views && <span>{item.views} weergaven</span>}
            {item.rating && (
              <div className="flex items-center gap-1">
                <span>⭐</span>
                <span>{item.rating}/5</span>
              </div>
            )}
          </div>

          {/* Tags */}
          {item.tags.length > 0 && (
            <div className="flex flex-wrap gap-2 mb-6">
              {item.tags.map((tag, index) => (
                <span 
                  key={index}
                  className="px-2 py-1 bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300 rounded text-sm"
                >
                  #{tag}
                </span>
              ))}
            </div>
          )}
        </header>

        {/* Media Content */}
        {item.video_url && (
          <div className="mb-8">
            <h2 className="text-xl font-semibold mb-4 text-gray-900 dark:text-gray-100">Video</h2>
            <div className="aspect-video bg-gray-200 dark:bg-gray-700 rounded-lg overflow-hidden">
              <video 
                controls 
                className="w-full h-full"
                poster={item.thumbnail_url}
                aria-label={`Video: ${item.title}`}
              >
                <source src={item.video_url} type="video/mp4" />
                <p>Je browser ondersteunt geen HTML5 video. 
                   <a href={item.video_url} className="text-blue-600 hover:text-blue-800">
                     Download de video
                   </a>
                </p>
              </video>
            </div>
          </div>
        )}

        {item.audio_url && (
          <div className="mb-8">
            <h2 className="text-xl font-semibold mb-4 text-gray-900 dark:text-gray-100">Audio</h2>
            <div className="bg-white dark:bg-gray-800 rounded-lg p-4 shadow-sm">
              <audio 
                controls 
                className="w-full"
                aria-label={`Audio: ${item.title}`}
              >
                <source src={item.audio_url} type="audio/mpeg" />
                <p>Je browser ondersteunt geen HTML5 audio. 
                   <a href={item.audio_url} className="text-blue-600 hover:text-blue-800">
                     Download het audiobestand
                   </a>
                </p>
              </audio>
            </div>
          </div>
        )}

        {/* Main Content */}
        <main className="bg-white dark:bg-gray-800 rounded-lg shadow-sm p-8 mb-8">
          <article 
            className="prose prose-lg dark:prose-invert max-w-none"
            dangerouslySetInnerHTML={{ __html: item.content }}
            aria-label="Hoofdinhoud van het artikel"
          />
        </main>

        {/* Related Items */}
        {relatedItems.length > 0 && (
          <section className="mb-8">
            <h2 className="text-2xl font-bold text-gray-900 dark:text-gray-100 mb-6">
              Gerelateerde content
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              {relatedItems.map((relatedItem) => (
                <Link
                  key={relatedItem.id}
                  href={`/knowledge/${relatedItem.id}`}
                  className="block bg-white dark:bg-gray-800 rounded-lg shadow-sm hover:shadow-md transition-shadow duration-200 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 dark:focus:ring-offset-gray-900"
                  aria-label={`Bekijk ${relatedItem.title}`}
                >
                  <div className="p-4">
                    {relatedItem.thumbnail_url && (
                      <OptimizedImage
                        src={relatedItem.thumbnail_url}
                        alt={relatedItem.title}
                        width={300}
                        height={200}
                        className="w-full h-32 object-cover rounded-lg mb-3"
                      />
                    )}
                    <h3 className="font-semibold text-gray-900 dark:text-gray-100 mb-2 line-clamp-2">
                      {relatedItem.title}
                    </h3>
                    <div className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-400">
                      <span>{getTypeIcon(relatedItem.type)}</span>
                      <span className="capitalize">{relatedItem.type}</span>
                      <span>•</span>
                      <span className="capitalize">{relatedItem.difficulty}</span>
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          </section>
        )}

        {/* Back to Overview */}
        <div className="text-center">
          <Link
            href="/knowledge"
            className="inline-flex items-center px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 dark:focus:ring-offset-gray-900 transition-colors"
            aria-label="Terug naar kennisbank overzicht"
          >
            <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
            Terug naar overzicht
          </Link>
        </div>
      </div>
    </div>
  );
}

export default function KnowledgeDetailPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 py-8">
        <div className="max-w-4xl mx-auto px-6">
          <LoadingSpinner />
        </div>
      </div>
    }>
      <KnowledgeDetailContent />
    </Suspense>
  );
}
