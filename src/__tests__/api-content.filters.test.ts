import { describe, it, expect, beforeAll, vi } from 'vitest';

describe('API /api/content/approved filters', () => {
  const baseUrl = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000';

  beforeAll(() => {
    // Provide a simple fetch mock if not present
    if (!(global.fetch as any).mock) {
      global.fetch = vi.fn();
    }
  });

  it('applies type filter', async () => {
    (global.fetch as any).mockResolvedValueOnce({
      ok: true,
      json: async () => ({
        success: true,
        data: {
          items: [{ id: '1', type: 'video' }],
          pagination: { limit: 10, offset: 0, total: 1, hasMore: false },
          statistics: {}
        }
      })
    });

    const res = await fetch(`${baseUrl}/api/content/approved?type=video`);
    expect(res.ok).toBe(true);
    const body = await res.json();
    expect(body.success).toBe(true);
    expect(Array.isArray(body.data.items)).toBe(true);
    expect(body.data.items.every((i: any) => i.type === 'video')).toBe(true);
  });

  it('applies difficulty and search filters', async () => {
    (global.fetch as any).mockResolvedValueOnce({
      ok: true,
      json: async () => ({
        success: true,
        data: {
          items: [{ id: '2', type: 'article', difficulty: 'beginner', title: 'intro' }],
          pagination: { limit: 10, offset: 0, total: 1, hasMore: false },
          statistics: {}
        }
      })
    });

    const res = await fetch(`${baseUrl}/api/content/approved?difficulty=beginner&search=intro`);
    expect(res.ok).toBe(true);
    const body = await res.json();
    expect(body.data.items[0].difficulty).toBe('beginner');
  });
});


