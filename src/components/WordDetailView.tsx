'use client';

import React, { useState, useCallback } from 'react';
import { useSpeechSynthesis } from '@/hooks/useSpeechSynthesis';
import WordCard from './WordCard';
import { LoadingSpinner } from './LoadingSpinner';
import { ErrorMessage } from './ErrorMessage';

interface WordDetail {
  id: string;
  word: string;
  meaning: string;
  example?: string;
  category?: string;
  difficulty?: 'easy' | 'medium' | 'hard';
  usage_frequency?: number;
  is_active?: boolean;
  created_at?: string;
  updated_at?: string;
}

interface WordDetailViewProps {
  word: string;
  onBack: () => void;
  className?: string;
}

export default function WordDetailView({ word, onBack, className = '' }: WordDetailViewProps) {
  const [wordDetail, setWordDetail] = useState<WordDetail | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [similarWords, setSimilarWords] = useState<WordDetail[]>([]);
  const [showSubmissionForm, setShowSubmissionForm] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [submitSuccess, setSubmitSuccess] = useState(false);
  
  const { speak, isPlaying, isSupported } = useSpeechSynthesis();

  // Fetch word details
  React.useEffect(() => {
    const fetchWordDetail = async () => {
      setLoading(true);
      setError(null);
      
      try {
        // Try to fetch detailed word information
        const response = await fetch(`/api/words/${encodeURIComponent(word)}`);
        if (response.ok) {
          const data = await response.json();
          setWordDetail(data.word);
          setSimilarWords(data.similar_words || []);
        } else if (response.status === 404) {
          // Word not found, show submission form
          setError(`Woord "${word}" niet gevonden in de database`);
          setShowSubmissionForm(true);
        } else {
          setError('Kon woorddetails niet laden');
        }
      } catch (err) {
        setError('Er is een fout opgetreden bij het laden van de woorddetails');
        console.error('Error fetching word detail:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchWordDetail();
  }, [word]);

  const handleSpeak = useCallback(() => {
    if (wordDetail) {
      speak(`${wordDetail.word}. ${wordDetail.meaning}`);
    }
  }, [wordDetail, speak]);

  const handleSubmitWord = useCallback(async (formData: any) => {
    setSubmitting(true);
    setError(null);
    
    try {
      const response = await fetch('/api/community/submit', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          word: formData.word,
          definition: formData.meaning,
          example: formData.example,
          context: formData.context,
          source: formData.source
        }),
      });

      if (response.ok) {
        setSubmitSuccess(true);
        setShowSubmissionForm(false);
        // Refresh the page after a delay to show the new word
        setTimeout(() => {
          window.location.reload();
        }, 2000);
      } else {
        const errorData = await response.json();
        setError(errorData.error || 'Er is een fout opgetreden bij het indienen');
      }
    } catch (err) {
      setError('Er is een fout opgetreden bij het indienen van het woord');
      console.error('Error submitting word:', err);
    } finally {
      setSubmitting(false);
    }
  }, []);

  if (loading) {
    return (
      <div className={`flex items-center justify-center py-12 ${className}`}>
        <div className="text-center">
          <LoadingSpinner />
          <p className="mt-4 text-gray-600">Woorddetails worden geladen...</p>
        </div>
      </div>
    );
  }

  if (error && !wordDetail) {
    return (
      <div className={`space-y-6 ${className}`}>
        <div className="flex items-center gap-4">
          <button
            onClick={onBack}
            className="px-4 py-2 bg-gray-200 hover:bg-gray-300 rounded-lg transition-colors"
          >
            ← Terug
          </button>
          <h1 className="text-2xl font-bold text-gray-900">{word}</h1>
        </div>
        
        <div className="bg-red-50 border border-red-200 rounded-lg p-4">
          <ErrorMessage message={error} />
        </div>

        {showSubmissionForm && (
          <WordSubmissionForm
            word={word}
            onSubmit={handleSubmitWord}
            submitting={submitting}
            onCancel={() => setShowSubmissionForm(false)}
          />
        )}
      </div>
    );
  }

  if (submitSuccess) {
    return (
      <div className={`space-y-6 ${className}`}>
        <div className="flex items-center gap-4">
          <button
            onClick={onBack}
            className="px-4 py-2 bg-gray-200 hover:bg-gray-300 rounded-lg transition-colors"
          >
            ← Terug
          </button>
          <h1 className="text-2xl font-bold text-gray-900">{word}</h1>
        </div>
        
        <div className="bg-green-50 border border-green-200 rounded-lg p-6 text-center">
          <div className="text-green-600 text-4xl mb-4">✅</div>
          <h3 className="text-lg font-semibold text-green-800 mb-2">
            Woord succesvol ingediend!
          </h3>
          <p className="text-green-700">
            Je woord is ingediend voor beoordeling. Het wordt binnenkort toegevoegd aan de database.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className={`space-y-6 ${className}`}>
      {/* Header */}
      <div className="flex items-center gap-4">
        <button
          onClick={onBack}
          className="px-4 py-2 bg-gray-200 hover:bg-gray-300 rounded-lg transition-colors"
        >
          ← Terug
        </button>
        <h1 className="text-2xl font-bold text-gray-900">{word}</h1>
      </div>

      {/* Word Detail Card */}
      {wordDetail && (
        <div className="bg-white rounded-lg shadow-lg p-6">
          <div className="flex items-start justify-between mb-4">
            <div>
              <h2 className="text-3xl font-bold text-gray-900 mb-2">{wordDetail.word}</h2>
              <div className="flex gap-2 mb-4">
                {wordDetail.category && (
                  <span className="px-3 py-1 bg-blue-100 text-blue-800 rounded-full text-sm font-medium">
                    {wordDetail.category}
                  </span>
                )}
                {wordDetail.difficulty && (
                  <span className={`px-3 py-1 rounded-full text-sm font-medium ${
                    wordDetail.difficulty === 'easy' ? 'bg-green-100 text-green-800' :
                    wordDetail.difficulty === 'medium' ? 'bg-yellow-100 text-yellow-800' :
                    'bg-red-100 text-red-800'
                  }`}>
                    {wordDetail.difficulty === 'easy' ? 'Makkelijk' :
                     wordDetail.difficulty === 'medium' ? 'Gemiddeld' : 'Moeilijk'}
                  </span>
                )}
              </div>
            </div>
            
            {isSupported && (
              <button
                onClick={handleSpeak}
                disabled={isPlaying}
                className="p-3 bg-blue-100 hover:bg-blue-200 rounded-full transition-colors disabled:opacity-50"
                aria-label="Uitspraak afspelen"
              >
                {isPlaying ? '🔊' : '🔇'}
              </button>
            )}
          </div>

          <div className="space-y-4">
            <div>
              <h3 className="text-lg font-semibold text-gray-900 mb-2">Betekenis</h3>
              <p className="text-gray-700 text-lg">{wordDetail.meaning}</p>
            </div>

            {wordDetail.example && (
              <div>
                <h3 className="text-lg font-semibold text-gray-900 mb-2">Voorbeeld</h3>
                <div className="bg-gray-50 rounded-lg p-4">
                  <p className="text-gray-700 italic">"{wordDetail.example}"</p>
                </div>
              </div>
            )}

            {wordDetail.usage_frequency && (
              <div>
                <h3 className="text-lg font-semibold text-gray-900 mb-2">Populariteit</h3>
                <div className="flex items-center gap-2">
                  <div className="w-32 bg-gray-200 rounded-full h-2">
                    <div 
                      className="bg-blue-600 h-2 rounded-full" 
                      style={{ width: `${Math.min((wordDetail.usage_frequency / 100) * 100, 100)}%` }}
                    ></div>
                  </div>
                  <span className="text-sm text-gray-600">
                    {wordDetail.usage_frequency} zoekopdrachten
                  </span>
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Similar Words */}
      {similarWords.length > 0 && (
        <div>
          <h3 className="text-xl font-semibold text-gray-900 mb-4">Vergelijkbare woorden</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {similarWords.map((similarWord) => (
              <WordCard
                key={similarWord.id}
                word={similarWord}
                showCategory={true}
                showDifficulty={true}
                enableFeedback={true}
                className="cursor-pointer hover:shadow-lg transition-shadow"
              />
            ))}
          </div>
        </div>
      )}

      {/* Community Submission Form */}
      {!wordDetail && (
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-6">
          <h3 className="text-lg font-semibold text-blue-900 mb-4">
            Woord niet gevonden? Help ons!
          </h3>
          <p className="text-blue-700 mb-4">
            Dit woord staat nog niet in onze database. Voeg het toe zodat anderen het ook kunnen leren!
          </p>
          <button
            onClick={() => setShowSubmissionForm(true)}
            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
          >
            Woord toevoegen
          </button>
        </div>
      )}

      {showSubmissionForm && (
        <WordSubmissionForm
          word={word}
          onSubmit={handleSubmitWord}
          submitting={submitting}
          onCancel={() => setShowSubmissionForm(false)}
        />
      )}
    </div>
  );
}

// Word Submission Form Component
interface WordSubmissionFormProps {
  word: string;
  onSubmit: (formData: any) => void;
  submitting: boolean;
  onCancel: () => void;
}

function WordSubmissionForm({ word, onSubmit, submitting, onCancel }: WordSubmissionFormProps) {
  const [formData, setFormData] = useState({
    word: word,
    meaning: '',
    example: '',
    context: '',
    source: ''
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit(formData);
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setFormData(prev => ({
      ...prev,
      [e.target.name]: e.target.value
    }));
  };

  return (
    <div className="bg-white rounded-lg shadow-lg p-6">
      <h3 className="text-xl font-semibold text-gray-900 mb-4">Nieuw woord toevoegen</h3>
      
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label htmlFor="word" className="block text-sm font-medium text-gray-700 mb-1">
            Woord *
          </label>
          <input
            type="text"
            id="word"
            name="word"
            value={formData.word}
            onChange={handleChange}
            required
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            placeholder="Bijv. 'skeer'"
          />
        </div>

        <div>
          <label htmlFor="meaning" className="block text-sm font-medium text-gray-700 mb-1">
            Betekenis *
          </label>
          <textarea
            id="meaning"
            name="meaning"
            value={formData.meaning}
            onChange={handleChange}
            required
            rows={3}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            placeholder="Uitgebreide uitleg van het woord..."
          />
        </div>

        <div>
          <label htmlFor="example" className="block text-sm font-medium text-gray-700 mb-1">
            Voorbeeldzin
          </label>
          <textarea
            id="example"
            name="example"
            value={formData.example}
            onChange={handleChange}
            rows={2}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            placeholder="Bijv. 'Ik ben helemaal skeer deze maand'"
          />
        </div>

        <div>
          <label htmlFor="context" className="block text-sm font-medium text-gray-700 mb-1">
            Context
          </label>
          <input
            type="text"
            id="context"
            name="context"
            value={formData.context}
            onChange={handleChange}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            placeholder="Bijv. 'Geld, financiën'"
          />
        </div>

        <div>
          <label htmlFor="source" className="block text-sm font-medium text-gray-700 mb-1">
            Bron
          </label>
          <input
            type="text"
            id="source"
            name="source"
            value={formData.source}
            onChange={handleChange}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            placeholder="Waar heb je dit woord gehoord?"
          />
        </div>

        <div className="flex gap-3 pt-4">
          <button
            type="submit"
            disabled={submitting}
            className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50"
          >
            {submitting ? 'Bezig met indienen...' : 'Woord indienen'}
          </button>
          <button
            type="button"
            onClick={onCancel}
            className="px-6 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 transition-colors"
          >
            Annuleren
          </button>
        </div>
      </form>
    </div>
  );
}
