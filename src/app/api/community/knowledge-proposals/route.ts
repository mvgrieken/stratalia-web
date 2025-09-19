import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import { logger } from '@/lib/logger';
import { normalizeError } from '@/lib/errors';
import { applyRateLimit } from '@/middleware/rateLimiter';

export async function POST(request: NextRequest) {
  try {
    const rate = applyRateLimit(request, 'community');
    if (!rate.allowed) return rate.response!;

    const body = await request.json();
    const { type, title, content, url, tags, difficulty } = body as { type: string; title: string; content?: string; url?: string; tags?: string[]; difficulty?: string };

    if (!type || !title) {
      return NextResponse.json({ error: 'type en title zijn verplicht' }, { status: 400 });
    }

    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
    if (!supabaseUrl || !supabaseAnonKey) {
      return NextResponse.json({ error: 'Database configuratie ontbreekt' }, { status: 500 });
    }

    const supabase = createClient(supabaseUrl, supabaseAnonKey);

    const { error } = await supabase
      .from('knowledge_proposals')
      .insert({
        type,
        title,
        content: content || null,
        url: url || null,
        tags: tags && tags.length ? tags : [],
        difficulty: difficulty || null,
        status: 'new'
      });

    if (error) {
      logger.error(`Knowledge proposal insert error: ${error instanceof Error ? error.message : String(error)}`);
      return NextResponse.json({ error: 'Opslaan mislukt' }, { status: 500 });
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    const normalized = normalizeError(error);
    logger.error(`Knowledge proposal API error: ${normalized}`);
    return NextResponse.json({ error: 'Onverwachte fout' }, { status: 500 });
  }
}
