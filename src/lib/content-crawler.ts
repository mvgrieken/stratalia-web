/**
 * Automated Content Crawler System
 * Dagelijkse zoekroutine voor nieuwe content in alle categorieën
 */

import { createClient } from '@supabase/supabase-js';
import { logger } from './logger';

export interface ContentSource {
  id: string;
  name: string;
  source_type: 'rss' | 'api' | 'website' | 'youtube_channel' | 'podcast_feed';
  base_url: string;
  api_endpoint?: string;
  content_type: 'book' | 'podcast' | 'video' | 'article' | 'music';
  metadata_mapping?: any;
  last_crawled_at?: string;
}

export interface CrawledContent {
  title: string;
  description: string;
  source_url: string;
  source_id: string;
  content_type: string;
  metadata: any;
  published_date?: string;
  thumbnail_url?: string;
  audio_url?: string;
  video_url?: string;
}

export class ContentCrawler {
  private supabase: any;

  constructor() {
    // Initialize Supabase client lazily to avoid build-time errors
    this.supabase = null;
  }

  private getSupabaseClient() {
    if (!this.supabase) {
      const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
      const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
      
      if (!supabaseUrl || !supabaseServiceKey) {
        throw new Error('Supabase environment variables not configured');
      }
      
      this.supabase = createClient(supabaseUrl, supabaseServiceKey);
    }
    return this.supabase;
  }

  /**
   * Main crawl orchestrator - runs all active sources
   */
  async runDailyCrawl(triggeredBy?: string): Promise<{
    totalSources: number;
    successfulSources: number;
    totalItemsFound: number;
    newProposals: number;
    errors: string[];
  }> {
    const startTime = Date.now();
    logger.info('Starting daily content crawl');

    try {
      // Get all active content sources
      const supabase = this.getSupabaseClient();
      const { data: sources, error: sourcesError } = await supabase
        .from('content_sources')
        .select('*')
        .eq('is_active', true)
        .order('last_crawled_at', { ascending: true, nullsFirst: true });

      if (sourcesError) {
        throw new Error(`Failed to fetch content sources: ${sourcesError.message}`);
      }

      const results = {
        totalSources: sources?.length || 0,
        successfulSources: 0,
        totalItemsFound: 0,
        newProposals: 0,
        errors: [] as string[]
      };

      // Process each source
      for (const source of sources || []) {
        try {
          const sourceResult = await this.crawlSource(source, triggeredBy);
          
          results.successfulSources++;
          results.totalItemsFound += sourceResult.itemsFound;
          results.newProposals += sourceResult.newProposals;

        } catch (error) {
          const errorMsg = `Source ${source.name}: ${error instanceof Error ? error.message : String(error)}`;
          results.errors.push(errorMsg);
          logger.error(`Crawl error for source ${source.name}: ${error instanceof Error ? error.message : String(error)}`);
        }
      }

      const executionTime = Date.now() - startTime;
      logger.info(`Daily crawl completed in ${executionTime}ms: ${results.newProposals} new proposals from ${results.successfulSources}/${results.totalSources} sources`);

      return results;

    } catch (error) {
      logger.error(`Daily crawl failed: ${error instanceof Error ? error.message : String(error)}`);
      throw error;
    }
  }

  /**
   * Crawl a specific content source
   */
  private async crawlSource(source: ContentSource, triggeredBy?: string): Promise<{
    itemsFound: number;
    newProposals: number;
  }> {
    const logId = await this.createCrawlLog(source.id, triggeredBy);
    
    try {
      let crawledItems: CrawledContent[] = [];

      // Route to appropriate crawler based on source type
      switch (source.source_type) {
        case 'rss':
          crawledItems = await this.crawlRSSFeed(source);
          break;
        case 'youtube_channel':
          crawledItems = await this.crawlYouTubeChannel(source);
          break;
        case 'podcast_feed':
          crawledItems = await this.crawlPodcastFeed(source);
          break;
        case 'api':
          crawledItems = await this.crawlAPIEndpoint(source);
          break;
        case 'website':
          crawledItems = await this.crawlWebsite(source);
          break;
        default:
          throw new Error(`Unsupported source type: ${source.source_type}`);
      }

      // Process crawled items and create proposals
      let newProposals = 0;
      
      for (const item of crawledItems) {
        const isNew = await this.createContentProposal(item, source);
        if (isNew) newProposals++;
      }

      // Update source last crawled time
      await this.supabase
        .from('content_sources')
        .update({ 
          last_crawled_at: new Date().toISOString(),
          last_successful_crawl: new Date().toISOString()
        })
        .eq('id', source.id);

      // Complete crawl log
      await this.completeCrawlLog(logId, 'completed', crawledItems.length, newProposals);

      return {
        itemsFound: crawledItems.length,
        newProposals
      };

    } catch (error) {
      await this.completeCrawlLog(logId, 'failed', 0, 0, [error instanceof Error ? error.message : String(error)]);
      throw error;
    }
  }

  /**
   * Crawl RSS feed for new content
   */
  private async crawlRSSFeed(source: ContentSource): Promise<CrawledContent[]> {
    try {
      const response = await fetch(source.base_url);
      const rssText = await response.text();
      
      // Simple RSS parsing (in production, use a proper RSS parser library)
      const items: CrawledContent[] = [];
      
      // Extract items from RSS (simplified implementation)
      const itemMatches = rssText.match(/<item[^>]*>[\s\S]*?<\/item>/gi) || [];
      
      for (const itemXml of itemMatches.slice(0, 10)) { // Limit to 10 newest
        const title = this.extractXMLValue(itemXml, 'title');
        const description = this.extractXMLValue(itemXml, 'description');
        const link = this.extractXMLValue(itemXml, 'link');
        const pubDate = this.extractXMLValue(itemXml, 'pubDate');
        
        if (title && link) {
          items.push({
            title: this.cleanHTML(title),
            description: this.cleanHTML(description || ''),
            source_url: link,
            source_id: this.generateSourceId(link),
            content_type: source.content_type,
            published_date: pubDate ? new Date(pubDate).toISOString().split('T')[0] : undefined,
            metadata: {
              rss_source: source.name,
              original_pub_date: pubDate
            }
          });
        }
      }

      return items;
    } catch (error) {
      throw new Error(`RSS crawl failed: ${error instanceof Error ? error.message : String(error)}`);
    }
  }

  /**
   * Crawl YouTube channel for new videos
   */
  private async crawlYouTubeChannel(source: ContentSource): Promise<CrawledContent[]> {
    // Note: Requires YouTube Data API key
    const apiKey = process.env.YOUTUBE_API_KEY;
    if (!apiKey) {
      throw new Error('YouTube API key not configured');
    }

    try {
      // Extract channel ID from URL
      const channelId = this.extractYouTubeChannelId(source.base_url);
      if (!channelId) {
        throw new Error('Invalid YouTube channel URL');
      }

      // Get recent videos from channel
      const apiUrl = `https://www.googleapis.com/youtube/v3/search?key=${apiKey}&channelId=${channelId}&part=snippet&order=date&maxResults=10&type=video`;
      
      const response = await fetch(apiUrl);
      const data = await response.json();

      if (!response.ok) {
        throw new Error(`YouTube API error: ${data.error?.message || 'Unknown error'}`);
      }

      const items: CrawledContent[] = [];

      for (const video of data.items || []) {
        items.push({
          title: video.snippet.title,
          description: video.snippet.description,
          source_url: `https://www.youtube.com/watch?v=${video.id.videoId}`,
          source_id: video.id.videoId,
          content_type: 'video',
          published_date: video.snippet.publishedAt.split('T')[0],
          thumbnail_url: video.snippet.thumbnails?.medium?.url,
          video_url: `https://www.youtube.com/watch?v=${video.id.videoId}`,
          metadata: {
            channel_name: video.snippet.channelTitle,
            channel_id: video.snippet.channelId,
            youtube_video_id: video.id.videoId,
            thumbnail_high: video.snippet.thumbnails?.high?.url
          }
        });
      }

      return items;
    } catch (error) {
      throw new Error(`YouTube crawl failed: ${error instanceof Error ? error.message : String(error)}`);
    }
  }

  /**
   * Crawl podcast feed for new episodes
   */
  private async crawlPodcastFeed(source: ContentSource): Promise<CrawledContent[]> {
    // Similar to RSS but with podcast-specific metadata
    return this.crawlRSSFeed(source); // Reuse RSS logic for now
  }

  /**
   * Crawl API endpoint for structured data
   */
  private async crawlAPIEndpoint(source: ContentSource): Promise<CrawledContent[]> {
    if (!source.api_endpoint) {
      throw new Error('API endpoint not configured');
    }

    try {
      const response = await fetch(source.api_endpoint);
      const data = await response.json();

      // Transform API data based on metadata mapping
      const items: CrawledContent[] = [];
      
      // This would need to be customized per API
      // For now, assume a generic structure
      if (Array.isArray(data)) {
        for (const item of data.slice(0, 10)) {
          items.push({
            title: item.title || item.name,
            description: item.description || item.summary,
            source_url: item.url || item.link,
            source_id: item.id || this.generateSourceId(item.url),
            content_type: source.content_type,
            metadata: item
          });
        }
      }

      return items;
    } catch (error) {
      throw new Error(`API crawl failed: ${error instanceof Error ? error.message : String(error)}`);
    }
  }

  /**
   * Crawl website for content changes
   */
  private async crawlWebsite(source: ContentSource): Promise<CrawledContent[]> {
    // Basic website crawling (in production, use proper scraping tools)
    try {
      const response = await fetch(source.base_url);
      const html = await response.text();
      
      // Extract basic metadata (simplified)
      const title = this.extractHTMLTitle(html);
      const description = this.extractHTMLDescription(html);
      
      if (title) {
        return [{
          title,
          description: description || '',
          source_url: source.base_url,
          source_id: this.generateSourceId(source.base_url),
          content_type: source.content_type,
          metadata: {
            last_crawled: new Date().toISOString(),
            content_length: html.length
          }
        }];
      }

      return [];
    } catch (error) {
      throw new Error(`Website crawl failed: ${error instanceof Error ? error.message : String(error)}`);
    }
  }

  /**
   * Create content proposal from crawled item
   */
  private async createContentProposal(item: CrawledContent, source: ContentSource): Promise<boolean> {
    try {
      // Check if item already exists
      const { data: existing } = await this.supabase
        .from('knowledge_items')
        .select('id, content_hash')
        .eq('source_id', item.source_id)
        .single();

      const contentHash = this.generateContentHash(item);
      
      if (existing) {
        // Check if content has changed
        if (existing.content_hash === contentHash) {
          return false; // No changes
        }
        
        // Create update proposal
        await this.supabase
          .from('content_proposals')
          .insert({
            existing_item_id: existing.id,
            proposal_type: 'update',
            proposed_data: {
              ...item,
              content_hash: contentHash
            },
            source_type: 'auto_discovery',
            discovery_source_id: source.id,
            priority_score: 2 // Updates have higher priority
          });

        return true;
      } else {
        // Create new item proposal
        await this.supabase
          .from('content_proposals')
          .insert({
            proposal_type: 'new',
            proposed_data: {
              ...item,
              content_hash: contentHash,
              auto_discovered: true
            },
            source_type: 'auto_discovery',
            discovery_source_id: source.id,
            priority_score: 1
          });

        return true;
      }
    } catch (error) {
      logger.error(`Failed to create content proposal: ${error instanceof Error ? error.message : String(error)}`);
      return false;
    }
  }

  /**
   * Utility functions
   */
  private extractXMLValue(xml: string, tag: string): string {
    const match = xml.match(new RegExp(`<${tag}[^>]*>([\\s\\S]*?)</${tag}>`, 'i'));
    return match ? match[1].trim() : '';
  }

  private extractHTMLTitle(html: string): string {
    const match = html.match(/<title[^>]*>([\s\S]*?)<\/title>/i);
    return match ? this.cleanHTML(match[1].trim()) : '';
  }

  private extractHTMLDescription(html: string): string {
    const match = html.match(/<meta[^>]*name=["']description["'][^>]*content=["']([^"']*)["'][^>]*>/i);
    return match ? match[1].trim() : '';
  }

  private cleanHTML(text: string): string {
    return text
      .replace(/<[^>]*>/g, '') // Remove HTML tags
      .replace(/&[^;]+;/g, ' ') // Remove HTML entities
      .replace(/\s+/g, ' ') // Normalize whitespace
      .trim();
  }

  private generateSourceId(url: string): string {
    return Buffer.from(url).toString('base64').substring(0, 32);
  }

  private generateContentHash(item: CrawledContent): string {
    const content = `${item.title}|${item.description}|${item.source_url}`;
    return Buffer.from(content).toString('base64');
  }

  private extractYouTubeChannelId(url: string): string | null {
    const match = url.match(/(?:youtube\.com\/channel\/|youtube\.com\/c\/|youtube\.com\/user\/)([^/?]+)/);
    return match ? match[1] : null;
  }

  private async createCrawlLog(sourceId: string, triggeredBy?: string): Promise<string> {
    const { data, error } = await this.supabase
      .from('content_crawl_logs')
      .insert({
        source_id: sourceId,
        crawl_type: triggeredBy ? 'manual' : 'scheduled',
        status: 'running',
        triggered_by: triggeredBy || null
      })
      .select('id')
      .single();

    if (error) {
      throw new Error(`Failed to create crawl log: ${error.message}`);
    }

    return data.id;
  }

  private async completeCrawlLog(
    logId: string, 
    status: string, 
    itemsFound: number, 
    newProposals: number, 
    errors: string[] = []
  ): Promise<void> {
    await this.supabase
      .from('content_crawl_logs')
      .update({
        status,
        completed_at: new Date().toISOString(),
        items_found: itemsFound,
        items_new: newProposals,
        items_errors: errors.length,
        error_details: errors.length > 0 ? errors : null,
        execution_time_ms: Date.now() - new Date().getTime()
      })
      .eq('id', logId);
  }
}

/**
 * Initialize default content sources
 */
export async function initializeDefaultSources(): Promise<void> {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
  const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;
  const supabase = createClient(supabaseUrl, supabaseServiceKey);

  const defaultSources = [
    {
      name: 'Nederlandse Podcasts RSS',
      source_type: 'rss',
      base_url: 'https://feeds.example.com/dutch-podcasts.xml',
      content_type: 'podcast',
      check_frequency: 'daily'
    },
    {
      name: 'Educatieve YouTube Kanalen',
      source_type: 'youtube_channel', 
      base_url: 'https://www.youtube.com/channel/UC_example',
      content_type: 'video',
      check_frequency: 'daily'
    },
    {
      name: 'Nederlandse Wikipedia Recent Changes',
      source_type: 'api',
      base_url: 'https://nl.wikipedia.org',
      api_endpoint: 'https://nl.wikipedia.org/w/api.php?action=query&list=recentchanges&format=json',
      content_type: 'article',
      check_frequency: 'daily'
    }
  ];

  for (const source of defaultSources) {
    const { error } = await supabase
      .from('content_sources')
      .upsert(source, { onConflict: 'base_url' });

    if (error) {
      logger.error(`Failed to initialize source ${source.name}: ${error instanceof Error ? error.message : String(error)}`);
    }
  }
}

// Export factory function instead of instance to avoid build-time initialization
export function createContentCrawler(): ContentCrawler {
  return new ContentCrawler();
}

// Lazy singleton for runtime use
let _contentCrawler: ContentCrawler | null = null;
export function getContentCrawler(): ContentCrawler {
  if (!_contentCrawler) {
    _contentCrawler = new ContentCrawler();
  }
  return _contentCrawler;
}
