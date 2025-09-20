import { notFound } from 'next/navigation';
import { getMarkdownContentBySlug, getAllMarkdownContent } from '@/lib/markdown-content';
import MarkdownRenderer from '@/components/MarkdownRenderer';
import { logger } from '@/lib/logger';

interface KnowledgeDetailPageProps {
  params: {
    slug: string;
  };
}

export async function generateStaticParams() {
  try {
    const allContent = getAllMarkdownContent();
    return allContent.map((item) => ({
      slug: item.slug,
    }));
  } catch (error) {
    logger.error('Error generating static params:', error);
    return [];
  }
}

export default async function KnowledgeDetailPage({ params }: KnowledgeDetailPageProps) {
  const { slug } = params;
  
  try {
    const content = getMarkdownContentBySlug(slug);
    
    if (!content) {
      notFound();
    }

    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
        <div className="max-w-4xl mx-auto px-4 py-8">
          {/* Header */}
          <div className="mb-8">
            <div className="flex items-center gap-4 mb-4">
              <span className={`px-3 py-1 rounded-full text-sm font-medium ${
                content.difficulty === 'beginner' 
                  ? 'bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-400'
                  : content.difficulty === 'intermediate'
                  ? 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/20 dark:text-yellow-400'
                  : 'bg-red-100 text-red-800 dark:bg-red-900/20 dark:text-red-400'
              }`}>
                {content.difficulty === 'beginner' ? 'Beginner' : 
                 content.difficulty === 'intermediate' ? 'Gemiddeld' : 'Gevorderd'}
              </span>
              <span className="px-3 py-1 rounded-full text-sm font-medium bg-blue-100 text-blue-800 dark:bg-blue-900/20 dark:text-blue-400">
                {content.type === 'article' ? 'Artikel' :
                 content.type === 'video' ? 'Video' :
                 content.type === 'podcast' ? 'Podcast' :
                 content.type === 'infographic' ? 'Infographic' : content.type}
              </span>
              <span className="px-3 py-1 rounded-full text-sm font-medium bg-purple-100 text-purple-800 dark:bg-purple-900/20 dark:text-purple-400">
                {content.category}
              </span>
            </div>
            
            <h1 className="text-4xl font-bold text-gray-900 dark:text-gray-100 mb-4">
              {content.title}
            </h1>
            
            <div className="flex items-center gap-4 text-sm text-gray-600 dark:text-gray-400">
              <span>Door {content.author}</span>
              <span>•</span>
              <span>{new Date(content.created_at).toLocaleDateString('nl-NL')}</span>
              {content.word_count && (
                <>
                  <span>•</span>
                  <span>{content.word_count} woorden</span>
                </>
              )}
              {content.duration && (
                <>
                  <span>•</span>
                  <span>{Math.floor(content.duration / 60)} min</span>
                </>
              )}
            </div>
          </div>

          {/* Thumbnail */}
          {content.thumbnail_url && (
            <div className="mb-8">
              <img 
                src={content.thumbnail_url} 
                alt={content.title}
                className="w-full h-64 object-cover rounded-lg shadow-md"
              />
            </div>
          )}

          {/* Tags */}
          {content.tags.length > 0 && (
            <div className="mb-8">
              <div className="flex flex-wrap gap-2">
                {content.tags.map((tag) => (
                  <a
                    key={tag}
                    href={`/knowledge?tag=${encodeURIComponent(tag)}`}
                    className="px-3 py-1 bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300 rounded-full text-sm hover:bg-blue-100 dark:hover:bg-blue-900/20 hover:text-blue-700 dark:hover:text-blue-300 transition-colors cursor-pointer"
                  >
                    #{tag}
                  </a>
                ))}
              </div>
            </div>
          )}

          {/* Content */}
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-8">
            <MarkdownRenderer content={content.content} />
          </div>

          {/* Footer */}
          <div className="mt-8 text-center text-sm text-gray-600 dark:text-gray-400">
            <p>Laatst bijgewerkt: {new Date(content.updated_at).toLocaleDateString('nl-NL')}</p>
          </div>
        </div>
      </div>
    );
  } catch (error) {
    logger.error('Error loading knowledge content:', error);
    notFound();
  }
}
