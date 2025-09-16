'use client';

import React, { useState } from 'react';

interface Submission {
  word: string;
  definition: string;
  example: string;
  context: string;
  source: string;
}

export default function CommunityPage() {
  const [submission, setSubmission] = useState<Submission>({
    word: '',
    definition: '',
    example: '',
    context: '',
    source: ''
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [validationErrors, setValidationErrors] = useState<Record<string, string>>({});

  const validateSubmission = (): boolean => {
    const errors: Record<string, string> = {};
    
    // Word validation
    if (!submission.word.trim()) {
      errors.word = 'Woord is verplicht';
    } else if (submission.word.trim().length < 2) {
      errors.word = 'Woord moet minimaal 2 karakters bevatten';
    } else if (submission.word.trim().length > 50) {
      errors.word = 'Woord mag maximaal 50 karakters bevatten';
    }
    
    // Definition validation
    if (!submission.definition.trim()) {
      errors.definition = 'Betekenis is verplicht';
    } else if (submission.definition.trim().length < 10) {
      errors.definition = 'Betekenis moet minimaal 10 karakters bevatten';
    } else if (submission.definition.trim().length > 500) {
      errors.definition = 'Betekenis mag maximaal 500 karakters bevatten';
    }
    
    // Example validation
    if (!submission.example.trim()) {
      errors.example = 'Voorbeeldzin is verplicht';
    } else if (submission.example.trim().length < 10) {
      errors.example = 'Voorbeeldzin moet minimaal 10 karakters bevatten';
    } else if (submission.example.trim().length > 200) {
      errors.example = 'Voorbeeldzin mag maximaal 200 karakters bevatten';
    }
    
    // Context validation (optional but if provided, should be reasonable)
    if (submission.context.trim() && submission.context.trim().length > 300) {
      errors.context = 'Context mag maximaal 300 karakters bevatten';
    }
    
    // Source validation (optional but if provided, should be reasonable)
    if (submission.source.trim() && submission.source.trim().length > 100) {
      errors.source = 'Bron mag maximaal 100 karakters bevatten';
    }
    
    setValidationErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Clear previous errors
    setError(null);
    setValidationErrors({});
    
    // Validate submission
    if (!validateSubmission()) {
      return;
    }
    
    setIsSubmitting(true);

    try {
      const response = await fetch('/api/community/submit', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(submission),
      });

      if (response.ok) {
        const data = await response.json();
        setSubmitted(true);
        setSubmission({
          word: '',
          definition: '',
          example: '',
          context: '',
          source: ''
        });
        setError(null);
      } else {
        const errorData = await response.json().catch(() => ({}));
        setError(errorData.error || 'Er is een fout opgetreden bij het indienen. Probeer het opnieuw.');
      }
    } catch (error) {
      console.error('Error submitting word:', error);
      setError('Er is een netwerkfout opgetreden. Controleer je internetverbinding en probeer het opnieuw.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleInputChange = (field: keyof Submission, value: string) => {
    setSubmission(prev => ({
      ...prev,
      [field]: value
    }));
  };

  if (submitted) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="max-w-md mx-auto bg-white rounded-lg shadow-lg p-8 text-center">
          <div className="text-6xl mb-4">🎉</div>
          <h1 className="text-2xl font-bold text-gray-900 mb-4">Bedankt voor je bijdrage!</h1>
          <p className="text-gray-600 mb-6">
            Je woord is ingediend en wordt beoordeeld door ons team. 
            Je ontvangt punten zodra het wordt goedgekeurd!
          </p>
          <div className="space-x-4">
            <button
              onClick={() => setSubmitted(false)}
              className="bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700"
            >
              Nog een woord toevoegen
            </button>
            <button
              onClick={() => window.location.href = '/'}
              className="border border-gray-300 text-gray-700 px-6 py-3 rounded-lg hover:bg-gray-50"
            >
              Terug naar Home
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="container mx-auto px-4 py-8">
        <div className="max-w-2xl mx-auto">
          <h1 className="text-3xl font-bold text-gray-900 mb-8 text-center">
            Draag bij aan Stratalia
          </h1>

          <div className="bg-white rounded-lg shadow-lg p-8">
            <div className="mb-6">
              <h2 className="text-xl font-semibold text-gray-900 mb-2">
                Voeg een nieuw straattaalwoord toe
              </h2>
              <p className="text-gray-600">
                Help andere ouders door straattaalwoorden toe te voegen die je hebt gehoord. 
                Ons team beoordeelt alle inzendingen voordat ze worden toegevoegd aan de database.
              </p>
            </div>

            <form onSubmit={handleSubmit} className="space-y-6">
              <div>
                <label htmlFor="word" className="block text-sm font-medium text-gray-700 mb-2">
                  straattaalwoord *
                </label>
                <input
                  type="text"
                  id="word"
                  value={submission.word}
                  onChange={(e) => handleInputChange('word', e.target.value)}
                  placeholder="bijv. 'skeer', 'breezy', 'flexen'"
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  required
                />
              </div>

              <div>
                <label htmlFor="definition" className="block text-sm font-medium text-gray-700 mb-2">
                  Betekenis *
                </label>
                <textarea
                  id="definition"
                  value={submission.definition}
                  onChange={(e) => handleInputChange('definition', e.target.value)}
                  placeholder="Leg uit wat dit woord betekent in het Nederlands"
                  rows={3}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  required
                />
              </div>

              <div>
                <label htmlFor="example" className="block text-sm font-medium text-gray-700 mb-2">
                  Voorbeeldzin
                </label>
                <textarea
                  id="example"
                  value={submission.example}
                  onChange={(e) => handleInputChange('example', e.target.value)}
                  placeholder="Geef een voorbeeldzin waarin het woord wordt gebruikt"
                  rows={2}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>

              <div>
                <label htmlFor="context" className="block text-sm font-medium text-gray-700 mb-2">
                  Context
                </label>
                <textarea
                  id="context"
                  value={submission.context}
                  onChange={(e) => handleInputChange('context', e.target.value)}
                  placeholder="Extra context: waar heb je dit woord gehoord? In welke situatie wordt het gebruikt?"
                  rows={2}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>

              <div>
                <label htmlFor="source" className="block text-sm font-medium text-gray-700 mb-2">
                  Bron
                </label>
                <input
                  type="text"
                  id="source"
                  value={submission.source}
                  onChange={(e) => handleInputChange('source', e.target.value)}
                  placeholder="Waar heb je dit woord gehoord? (bijv. 'mijn tiener', 'social media', 'muziek')"
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>

              <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                <h3 className="font-semibold text-blue-900 mb-2">💡 Tips voor een goede inzending:</h3>
                <ul className="text-sm text-blue-800 space-y-1">
                  <li>• Zorg dat de betekenis duidelijk en accuraat is</li>
                  <li>• Geef een realistisch voorbeeld van hoe het woord wordt gebruikt</li>
                  <li>• Voeg context toe over waar je het hebt gehoord</li>
                  <li>• Je ontvangt 50 punten voor elke goedgekeurde inzending!</li>
                </ul>
              </div>

              <button
                type="submit"
                disabled={isSubmitting || !submission.word || !submission.definition}
                className="w-full bg-blue-600 text-white py-3 rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed font-medium"
              >
                {isSubmitting ? 'Wordt ingediend...' : 'Woord Indienen'}
              </button>
            </form>
          </div>

          {/* Recent Submissions */}
          <div className="mt-8 bg-white rounded-lg shadow-lg p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Recent toegevoegde woorden</h3>
            <div className="space-y-3">
              <div className="flex justify-between items-center p-3 bg-gray-50 rounded-lg">
                <div>
                  <span className="font-medium text-gray-900">skeer</span>
                  <span className="text-gray-600 ml-2">- arm, weinig geld hebben</span>
                </div>
                <span className="text-sm text-green-600 bg-green-100 px-2 py-1 rounded-full">
                  Goedgekeurd
                </span>
              </div>
              <div className="flex justify-between items-center p-3 bg-gray-50 rounded-lg">
                <div>
                  <span className="font-medium text-gray-900">breezy</span>
                  <span className="text-gray-600 ml-2">- cool, relaxed</span>
                </div>
                <span className="text-sm text-green-600 bg-green-100 px-2 py-1 rounded-full">
                  Goedgekeurd
                </span>
              </div>
              <div className="flex justify-between items-center p-3 bg-gray-50 rounded-lg">
                <div>
                  <span className="font-medium text-gray-900">flexen</span>
                  <span className="text-gray-600 ml-2">- opscheppen, pronken</span>
                </div>
                <span className="text-sm text-yellow-600 bg-yellow-100 px-2 py-1 rounded-full">
                  In beoordeling
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
