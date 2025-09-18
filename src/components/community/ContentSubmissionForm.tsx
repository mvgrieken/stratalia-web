'use client';

import { useState } from 'react';
import { logger } from '@/lib/logger';
import { useAuth } from '@/components/AuthProvider';
import { validateCommunitySubmission } from '@/lib/validation';

interface ContentSubmissionFormProps {
  onSuccess?: () => void;
  onCancel?: () => void;
}

type ContentType = 'book' | 'podcast' | 'video' | 'article' | 'music';

export default function ContentSubmissionForm({ onSuccess, onCancel }: ContentSubmissionFormProps) {
  const { user } = useAuth();
  const [contentType, setContentType] = useState<ContentType>('article');
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    source_url: '',
    author: '',
    category: '',
    tags: '',
    // Type-specific fields
    isbn: '', // for books
    publisher: '', // for books
    duration: '', // for videos/podcasts/music
    channel_name: '', // for videos/podcasts
    album: '', // for music
    artist: '', // for music
    published_date: '',
    language: 'nl'
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!user) {
      setError('Je moet ingelogd zijn om content voor te stellen');
      return;
    }

    setLoading(true);
    setError(null);

    try {
      // Prepare submission data based on content type
      const submissionData = {
        content_type: contentType,
        title: formData.title.trim(),
        description: formData.description.trim(),
        source_url: formData.source_url.trim(),
        metadata: buildMetadata(),
        tags: formData.tags.split(',').map(tag => tag.trim()).filter(Boolean),
        language: formData.language
      };

      // Validate submission
      const validatedData = validateCommunitySubmission(submissionData);

      // Submit to API
      const response = await fetch('/api/community/submit-content', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(validatedData)
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Indiening mislukt');
      }

      await response.json();
      
      // Reset form
      setFormData({
        title: '',
        description: '',
        source_url: '',
        author: '',
        category: '',
        tags: '',
        isbn: '',
        publisher: '',
        duration: '',
        channel_name: '',
        album: '',
        artist: '',
        published_date: '',
        language: 'nl'
      });

      onSuccess?.();

    } catch (err) {
      logger.error(`Submission error: ${err}`);
      setError(err instanceof Error ? err.message : 'Er is een fout opgetreden');
    } finally {
      setLoading(false);
    }
  };

  const buildMetadata = (): any => {
    const metadata: any = {
      submitted_by: user?.name || user?.email,
      submission_date: new Date().toISOString()
    };

    // Add type-specific metadata
    switch (contentType) {
      case 'book':
        if (formData.author) metadata.author = formData.author;
        if (formData.isbn) metadata.isbn = formData.isbn;
        if (formData.publisher) metadata.publisher = formData.publisher;
        if (formData.published_date) metadata.published_date = formData.published_date;
        break;
        
      case 'podcast':
        if (formData.channel_name) metadata.podcast_name = formData.channel_name;
        if (formData.author) metadata.host = formData.author;
        if (formData.duration) metadata.episode_duration = formData.duration;
        break;
        
      case 'video':
        if (formData.channel_name) metadata.channel_name = formData.channel_name;
        if (formData.duration) metadata.video_duration = formData.duration;
        if (formData.published_date) metadata.published_date = formData.published_date;
        break;
        
      case 'music':
        if (formData.artist) metadata.artist = formData.artist;
        if (formData.album) metadata.album = formData.album;
        if (formData.duration) metadata.track_duration = formData.duration;
        break;
        
      case 'article':
        if (formData.author) metadata.author = formData.author;
        if (formData.published_date) metadata.published_date = formData.published_date;
        break;
    }

    return metadata;
  };

  const getTypeSpecificFields = () => {
    switch (contentType) {
      case 'book':
        return (
          <>
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Auteur
              </label>
              <input
                type="text"
                value={formData.author}
                onChange={(e) => setFormData(prev => ({ ...prev, author: e.target.value }))}
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="Naam van de auteur"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                ISBN (optioneel)
              </label>
              <input
                type="text"
                value={formData.isbn}
                onChange={(e) => setFormData(prev => ({ ...prev, isbn: e.target.value }))}
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="978-..."
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Uitgever (optioneel)
              </label>
              <input
                type="text"
                value={formData.publisher}
                onChange={(e) => setFormData(prev => ({ ...prev, publisher: e.target.value }))}
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="Naam van de uitgever"
              />
            </div>
          </>
        );
        
      case 'podcast':
        return (
          <>
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Podcast naam
              </label>
              <input
                type="text"
                value={formData.channel_name}
                onChange={(e) => setFormData(prev => ({ ...prev, channel_name: e.target.value }))}
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="Naam van de podcast"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Host/Presentator
              </label>
              <input
                type="text"
                value={formData.author}
                onChange={(e) => setFormData(prev => ({ ...prev, author: e.target.value }))}
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="Naam van de host"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Duur (optioneel)
              </label>
              <input
                type="text"
                value={formData.duration}
                onChange={(e) => setFormData(prev => ({ ...prev, duration: e.target.value }))}
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="bijv. 45 minuten"
              />
            </div>
          </>
        );
        
      case 'video':
        return (
          <>
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Kanaal naam
              </label>
              <input
                type="text"
                value={formData.channel_name}
                onChange={(e) => setFormData(prev => ({ ...prev, channel_name: e.target.value }))}
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="YouTube kanaal of maker"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Duur (optioneel)
              </label>
              <input
                type="text"
                value={formData.duration}
                onChange={(e) => setFormData(prev => ({ ...prev, duration: e.target.value }))}
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="bijv. 10:30"
              />
            </div>
          </>
        );
        
      case 'music':
        return (
          <>
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Artiest
              </label>
              <input
                type="text"
                value={formData.artist}
                onChange={(e) => setFormData(prev => ({ ...prev, artist: e.target.value }))}
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="Naam van de artiest"
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Album (optioneel)
              </label>
              <input
                type="text"
                value={formData.album}
                onChange={(e) => setFormData(prev => ({ ...prev, album: e.target.value }))}
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="Album naam"
              />
            </div>
          </>
        );
        
      default:
        return (
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Auteur (optioneel)
            </label>
            <input
              type="text"
              value={formData.author}
              onChange={(e) => setFormData(prev => ({ ...prev, author: e.target.value }))}
              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="Naam van de auteur"
            />
          </div>
        );
    }
  };

  return (
    <div className="max-w-2xl mx-auto bg-white dark:bg-gray-800 rounded-lg shadow-lg p-6">
      <h2 className="text-2xl font-bold text-gray-900 dark:text-gray-100 mb-6">
        Content Voorstel Indienen
      </h2>

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Content Type Selection */}
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
            Type Content
          </label>
          <select
            value={contentType}
            onChange={(e) => setContentType(e.target.value as ContentType)}
            className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            required
          >
            <option value="article">📄 Artikel/Website</option>
            <option value="book">📚 Boek</option>
            <option value="podcast">🎧 Podcast</option>
            <option value="video">🎥 Video</option>
            <option value="music">🎵 Muziek</option>
          </select>
        </div>

        {/* Basic Fields */}
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
            Titel *
          </label>
          <input
            type="text"
            value={formData.title}
            onChange={(e) => setFormData(prev => ({ ...prev, title: e.target.value }))}
            className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            placeholder="Titel van de content"
            required
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
            Beschrijving *
          </label>
          <textarea
            value={formData.description}
            onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
            rows={4}
            className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            placeholder="Beschrijf waarom deze content waardevol is voor de kennisbank"
            required
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
            Bron URL *
          </label>
          <input
            type="url"
            value={formData.source_url}
            onChange={(e) => setFormData(prev => ({ ...prev, source_url: e.target.value }))}
            className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            placeholder="https://..."
            required
          />
        </div>

        {/* Type-specific fields */}
        {getTypeSpecificFields()}

        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
            Tags (gescheiden door komma's)
          </label>
          <input
            type="text"
            value={formData.tags}
            onChange={(e) => setFormData(prev => ({ ...prev, tags: e.target.value }))}
            className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            placeholder="bijv. educatie, nederlands, beginner"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
            Taal
          </label>
          <select
            value={formData.language}
            onChange={(e) => setFormData(prev => ({ ...prev, language: e.target.value }))}
            className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="nl">Nederlands</option>
            <option value="en">Engels</option>
            <option value="de">Duits</option>
            <option value="fr">Frans</option>
          </select>
        </div>

        {error && (
          <div className="bg-red-50 dark:bg-red-900 border border-red-200 dark:border-red-700 rounded-lg p-4">
            <p className="text-red-800 dark:text-red-200">{error}</p>
          </div>
        )}

        {/* Submit Buttons */}
        <div className="flex gap-4 pt-4">
          <button
            type="submit"
            disabled={loading}
            className="flex-1 bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 dark:focus:ring-offset-gray-900 disabled:opacity-50 transition-colors"
          >
            {loading ? (
              <div className="flex items-center justify-center">
                <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin mr-2"></div>
                Indienen...
              </div>
            ) : (
              'Content Voorstel Indienen'
            )}
          </button>
          
          {onCancel && (
            <button
              type="button"
              onClick={onCancel}
              disabled={loading}
              className="px-4 py-2 border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-gray-500 focus:ring-offset-2 dark:focus:ring-offset-gray-900 transition-colors"
            >
              Annuleren
            </button>
          )}
        </div>
      </form>
    </div>
  );
}
