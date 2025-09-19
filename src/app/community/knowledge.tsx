"use client";

import { useState } from 'react';
import { useRouter } from 'next/navigation';

type KnowledgeType = 'article' | 'video' | 'podcast' | 'infographic' | 'book' | 'music';

export default function KnowledgeProposalForm() {
  const router = useRouter();
  const [type, setType] = useState<KnowledgeType>('article');
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [url, setUrl] = useState('');
  const [tags, setTags] = useState<string>('');
  const [difficulty, setDifficulty] = useState<'beginner'|'intermediate'|'advanced'>('beginner');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    setSuccess(null);

    try {
      const response = await fetch('/api/community/knowledge-proposals', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          type,
          title,
          content: content || undefined,
          url: url || undefined,
          tags: tags ? tags.split(',').map(t => t.trim()).filter(Boolean) : [],
          difficulty
        })
      });

      const data = await response.json();
      if (!response.ok) {
        throw new Error(data.error || 'Opslaan mislukt');
      }

      setSuccess('Inzending ontvangen! Een moderator zal deze beoordelen.');
      setTitle('');
      setContent('');
      setUrl('');
      setTags('');
      setDifficulty('beginner');
      setType('article');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Er is een fout opgetreden');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 py-10">
      <div className="max-w-2xl mx-auto bg-white rounded-lg shadow p-6">
        <h1 className="text-2xl font-bold mb-4">Kennisitem indienen</h1>
        <p className="text-sm text-gray-600 mb-6">Dien een artikel, video, podcast, infographic, boek of muziek in voor de kennisbank.</p>

        {error && <div className="mb-4 p-3 bg-red-50 text-red-700 rounded">{error}</div>}
        {success && <div className="mb-4 p-3 bg-green-50 text-green-700 rounded">{success}</div>}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Type</label>
            <select value={type} onChange={e => setType(e.target.value as KnowledgeType)} className="w-full border rounded px-3 py-2">
              <option value="article">Artikel</option>
              <option value="video">Video</option>
              <option value="podcast">Podcast</option>
              <option value="infographic">Infographic</option>
              <option value="book">Boek</option>
              <option value="music">Muziek</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Titel</label>
            <input value={title} onChange={e => setTitle(e.target.value)} required className="w-full border rounded px-3 py-2" />
          </div>

          {(type === 'article' || type === 'infographic') && (
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Content</label>
              <textarea value={content} onChange={e => setContent(e.target.value)} rows={6} className="w-full border rounded px-3 py-2" />
            </div>
          )}

          {(type === 'video' || type === 'podcast' || type === 'book' || type === 'music') && (
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">URL</label>
              <input type="url" placeholder="https://..." value={url} onChange={e => setUrl(e.target.value)} className="w-full border rounded px-3 py-2" />
            </div>
          )}

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Tags (komma-gescheiden)</label>
            <input value={tags} onChange={e => setTags(e.target.value)} className="w-full border rounded px-3 py-2" />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Niveau</label>
            <select value={difficulty} onChange={e => setDifficulty(e.target.value as any)} className="w-full border rounded px-3 py-2">
              <option value="beginner">Beginner</option>
              <option value="intermediate">Gemiddeld</option>
              <option value="advanced">Gevorderd</option>
            </select>
          </div>

          <div className="pt-2">
            <button type="submit" disabled={loading} className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700 disabled:opacity-50">
              {loading ? 'Indienen...' : 'Indienen'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
