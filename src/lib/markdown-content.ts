import fs from 'fs';
import path from 'path';
import matter from 'gray-matter';

export interface MarkdownContent {
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
  video_url?: string;
  audio_url?: string;
  duration?: number;
  word_count?: number;
  slug: string;
  excerpt?: string;
}

const contentDirectory = path.join(process.cwd(), 'content', 'knowledge');

export function getAllMarkdownContent(): MarkdownContent[] {
  try {
    if (!fs.existsSync(contentDirectory)) {
      return [];
    }

    const fileNames = fs.readdirSync(contentDirectory);
    const allContent = fileNames
      .filter(name => name.endsWith('.md'))
      .map(fileName => {
        const slug = fileName.replace(/\.md$/, '');
        const fullPath = path.join(contentDirectory, fileName);
        const fileContents = fs.readFileSync(fullPath, 'utf8');
        const { data, content } = matter(fileContents);

        // Extract excerpt from content (first 200 characters)
        const excerpt = content
          .replace(/[#*`]/g, '') // Remove markdown formatting
          .substring(0, 200)
          .trim() + '...';

        // Count words in content
        const wordCount = content.split(/\s+/).length;

        return {
          id: data.id || slug,
          title: data.title || slug.replace(/-/g, ' '),
          content,
          type: data.type || 'article',
          difficulty: data.difficulty || 'beginner',
          category: data.category || 'algemeen',
          tags: data.tags || [],
          author: data.author || 'Stratalia Team',
          created_at: data.created_at || new Date().toISOString(),
          updated_at: data.updated_at || new Date().toISOString(),
          is_active: data.is_active !== false,
          thumbnail_url: data.thumbnail_url,
          video_url: data.video_url,
          audio_url: data.audio_url,
          duration: data.duration,
          word_count: wordCount,
          slug,
          excerpt
        };
      });

    return allContent.sort((a, b) => 
      new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
    );
  } catch (error) {
    console.error('Error reading markdown content:', error);
    return [];
  }
}

export function getMarkdownContentBySlug(slug: string): MarkdownContent | null {
  try {
    const fullPath = path.join(contentDirectory, `${slug}.md`);
    
    if (!fs.existsSync(fullPath)) {
      return null;
    }

    const fileContents = fs.readFileSync(fullPath, 'utf8');
    const { data, content } = matter(fileContents);

    // Extract excerpt from content
    const excerpt = content
      .replace(/[#*`]/g, '')
      .substring(0, 200)
      .trim() + '...';

    // Count words in content
    const wordCount = content.split(/\s+/).length;

    return {
      id: data.id || slug,
      title: data.title || slug.replace(/-/g, ' '),
      content,
      type: data.type || 'article',
      difficulty: data.difficulty || 'beginner',
      category: data.category || 'algemeen',
      tags: data.tags || [],
      author: data.author || 'Stratalia Team',
      created_at: data.created_at || new Date().toISOString(),
      updated_at: data.updated_at || new Date().toISOString(),
      is_active: data.is_active !== false,
      thumbnail_url: data.thumbnail_url,
      video_url: data.video_url,
      audio_url: data.audio_url,
      duration: data.duration,
      word_count: wordCount,
      slug,
      excerpt
    };
  } catch (error) {
    console.error('Error reading markdown content by slug:', error);
    return null;
  }
}

export function getMarkdownContentByCategory(category: string): MarkdownContent[] {
  const allContent = getAllMarkdownContent();
  return allContent.filter(item => 
    item.category.toLowerCase() === category.toLowerCase()
  );
}

export function getMarkdownContentByType(type: string): MarkdownContent[] {
  const allContent = getAllMarkdownContent();
  return allContent.filter(item => 
    item.type.toLowerCase() === type.toLowerCase()
  );
}

export function getMarkdownContentByDifficulty(difficulty: string): MarkdownContent[] {
  const allContent = getAllMarkdownContent();
  return allContent.filter(item => 
    item.difficulty.toLowerCase() === difficulty.toLowerCase()
  );
}

export function searchMarkdownContent(query: string): MarkdownContent[] {
  const allContent = getAllMarkdownContent();
  const lowercaseQuery = query.toLowerCase();
  
  return allContent.filter(item => 
    item.title.toLowerCase().includes(lowercaseQuery) ||
    item.content.toLowerCase().includes(lowercaseQuery) ||
    item.tags.some(tag => tag.toLowerCase().includes(lowercaseQuery)) ||
    item.category.toLowerCase().includes(lowercaseQuery)
  );
}

export function getMarkdownContentStats() {
  const allContent = getAllMarkdownContent();
  
  return {
    total: allContent.length,
    byType: {
      article: allContent.filter(item => item.type === 'article').length,
      video: allContent.filter(item => item.type === 'video').length,
      podcast: allContent.filter(item => item.type === 'podcast').length,
      infographic: allContent.filter(item => item.type === 'infographic').length,
    },
    byDifficulty: {
      beginner: allContent.filter(item => item.difficulty === 'beginner').length,
      intermediate: allContent.filter(item => item.difficulty === 'intermediate').length,
      advanced: allContent.filter(item => item.difficulty === 'advanced').length,
    },
    byCategory: allContent.reduce((acc, item) => {
      acc[item.category] = (acc[item.category] || 0) + 1;
      return acc;
    }, {} as Record<string, number>),
    totalWords: allContent.reduce((sum, item) => sum + (item.word_count || 0), 0),
    averageWords: allContent.length > 0 
      ? Math.round(allContent.reduce((sum, item) => sum + (item.word_count || 0), 0) / allContent.length)
      : 0
  };
}
