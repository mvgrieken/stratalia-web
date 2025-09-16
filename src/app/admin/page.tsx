'use client';

import { useState, useEffect } from 'react';
import { useAuth } from '@/components/AuthProvider';
import { useRouter } from 'next/navigation';

interface Word {
  id: string;
  word: string;
  meaning: string;
  example: string;
  difficulty: string;
  created_at: string;
}

interface QuizQuestion {
  id: string;
  question: string;
  correct_answer: string;
  wrong_answers: string[];
  difficulty: string;
  created_at: string;
}

interface KnowledgeItem {
  id: string;
  title: string;
  content: string;
  type: string;
  difficulty: string;
  created_at: string;
}

export default function AdminPage() {
  const { user } = useAuth();
  const router = useRouter();
  const [activeTab, setActiveTab] = useState('words');
  const [words, setWords] = useState<Word[]>([]);
  const [quizQuestions, setQuizQuestions] = useState<QuizQuestion[]>([]);
  const [knowledgeItems, setKnowledgeItems] = useState<KnowledgeItem[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [refreshStatus, setRefreshStatus] = useState<{[key: string]: 'idle' | 'loading' | 'success' | 'error'}>({});
  const [refreshMessage, setRefreshMessage] = useState('');

  // Redirect if not admin
  useEffect(() => {
    if (user && user.role !== 'admin') {
      router.push('/dashboard');
    }
  }, [user, router]);

  const fetchWords = async () => {
    setLoading(true);
    try {
      const response = await fetch('/api/admin/words');
      if (response.ok) {
        const data = await response.json();
        setWords(data.words || []);
      } else {
        setError('Fout bij ophalen van woorden');
      }
    } catch (err) {
      setError('Fout bij ophalen van woorden');
    } finally {
      setLoading(false);
    }
  };

  const fetchQuizQuestions = async () => {
    setLoading(true);
    try {
      const response = await fetch('/api/admin/quiz');
      if (response.ok) {
        const data = await response.json();
        setQuizQuestions(data.questions || []);
      } else {
        setError('Fout bij ophalen van quiz vragen');
      }
    } catch (err) {
      setError('Fout bij ophalen van quiz vragen');
    } finally {
      setLoading(false);
    }
  };

  const fetchKnowledgeItems = async () => {
    setLoading(true);
    try {
      const response = await fetch('/api/admin/knowledge');
      if (response.ok) {
        const data = await response.json();
        setKnowledgeItems(data.items || []);
      } else {
        setError('Fout bij ophalen van kennisbank items');
      }
    } catch (err) {
      setError('Fout bij ophalen van kennisbank items');
    } finally {
      setLoading(false);
    }
  };

  const refreshContent = async (type?: string) => {
    const refreshKey = type || 'all';
    setRefreshStatus(prev => ({ ...prev, [refreshKey]: 'loading' }));
    setRefreshMessage('');

    try {
      const url = type ? `/api/refresh-knowledge?type=${type}` : '/api/refresh-knowledge';
      const response = await fetch(url, { method: 'POST' });
      
      if (response.ok) {
        const data = await response.json();
        setRefreshStatus(prev => ({ ...prev, [refreshKey]: 'success' }));
        setRefreshMessage(`Succesvol ${data.data.refreshCount} items ververst`);
        
        // Refresh the current tab data
        if (activeTab === 'knowledge') {
          fetchKnowledgeItems();
        }
      } else {
        const errorData = await response.json();
        setRefreshStatus(prev => ({ ...prev, [refreshKey]: 'error' }));
        setRefreshMessage(`Fout: ${errorData.error}`);
      }
    } catch (err) {
      setRefreshStatus(prev => ({ ...prev, [refreshKey]: 'error' }));
      setRefreshMessage('Fout bij het verversen van content');
    }

    // Clear message after 5 seconds
    setTimeout(() => {
      setRefreshMessage('');
      setRefreshStatus(prev => ({ ...prev, [refreshKey]: 'idle' }));
    }, 5000);
  };

  useEffect(() => {
    if (user?.role === 'admin') {
      if (activeTab === 'words') fetchWords();
      if (activeTab === 'quiz') fetchQuizQuestions();
      if (activeTab === 'knowledge') fetchKnowledgeItems();
    }
  }, [activeTab, user]);

  if (!user || user.role !== 'admin') {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-gray-900 mb-4">Toegang geweigerd</h1>
          <p className="text-gray-600">Je hebt geen admin rechten om deze pagina te bekijken.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
        <div className="px-4 py-6 sm:px-0">
          <div className="border-b border-gray-200">
            <h1 className="text-3xl font-bold text-gray-900">Admin Dashboard</h1>
            <p className="mt-2 text-gray-600">Beheer de Stratalia content</p>
          </div>

          {/* Tabs */}
          <div className="mt-6">
            <nav className="flex space-x-8">
              <button
                onClick={() => setActiveTab('words')}
                className={`py-2 px-1 border-b-2 font-medium text-sm ${
                  activeTab === 'words'
                    ? 'border-blue-500 text-blue-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
              >
                Woorden ({words.length})
              </button>
              <button
                onClick={() => setActiveTab('quiz')}
                className={`py-2 px-1 border-b-2 font-medium text-sm ${
                  activeTab === 'quiz'
                    ? 'border-blue-500 text-blue-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
              >
                Quiz Vragen ({quizQuestions.length})
              </button>
              <button
                onClick={() => setActiveTab('knowledge')}
                className={`py-2 px-1 border-b-2 font-medium text-sm ${
                  activeTab === 'knowledge'
                    ? 'border-blue-500 text-blue-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
              >
                Kennisbank ({knowledgeItems.length})
              </button>
            </nav>
          </div>

          {/* Content */}
          <div className="mt-6">
            {error && (
              <div className="bg-red-50 border border-red-200 text-red-600 px-4 py-3 rounded-md mb-4">
                {error}
              </div>
            )}

            {loading ? (
              <div className="text-center py-8">
                <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
                <p className="mt-2 text-gray-600">Laden...</p>
              </div>
            ) : (
              <>
                {activeTab === 'words' && (
                  <div className="bg-white shadow overflow-hidden sm:rounded-md">
                    <div className="px-4 py-5 sm:px-6">
                      <h3 className="text-lg leading-6 font-medium text-gray-900">Woorden Database</h3>
                      <p className="mt-1 max-w-2xl text-sm text-gray-500">
                        Beheer alle straattaal woorden in de database
                      </p>
                    </div>
                    <ul className="divide-y divide-gray-200">
                      {words.map((word) => (
                        <li key={word.id}>
                          <div className="px-4 py-4 sm:px-6">
                            <div className="flex items-center justify-between">
                              <div className="flex-1">
                                <div className="flex items-center">
                                  <p className="text-sm font-medium text-blue-600 truncate">
                                    {word.word}
                                  </p>
                                  <span className={`ml-2 inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                                    word.difficulty === 'easy' ? 'bg-green-100 text-green-800' :
                                    word.difficulty === 'medium' ? 'bg-yellow-100 text-yellow-800' :
                                    'bg-red-100 text-red-800'
                                  }`}>
                                    {word.difficulty}
                                  </span>
                                </div>
                                <p className="mt-1 text-sm text-gray-500">{word.meaning}</p>
                                {word.example && (
                                  <p className="mt-1 text-sm text-gray-400 italic">"{word.example}"</p>
                                )}
                              </div>
                              <div className="ml-4 flex-shrink-0">
                                <span className="text-xs text-gray-400">
                                  {new Date(word.created_at).toLocaleDateString('nl-NL')}
                                </span>
                              </div>
                            </div>
                          </div>
                        </li>
                      ))}
                    </ul>
                  </div>
                )}

                {activeTab === 'quiz' && (
                  <div className="bg-white shadow overflow-hidden sm:rounded-md">
                    <div className="px-4 py-5 sm:px-6">
                      <h3 className="text-lg leading-6 font-medium text-gray-900">Quiz Vragen</h3>
                      <p className="mt-1 max-w-2xl text-sm text-gray-500">
                        Beheer alle quiz vragen in de database
                      </p>
                    </div>
                    <ul className="divide-y divide-gray-200">
                      {quizQuestions.map((question) => (
                        <li key={question.id}>
                          <div className="px-4 py-4 sm:px-6">
                            <div className="flex items-center justify-between">
                              <div className="flex-1">
                                <p className="text-sm font-medium text-gray-900">
                                  {question.question}
                                </p>
                                <p className="mt-1 text-sm text-green-600">
                                  Correct: {question.correct_answer}
                                </p>
                                <p className="mt-1 text-sm text-gray-500">
                                  Fout: {question.wrong_answers.join(', ')}
                                </p>
                                <span className={`mt-2 inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                                  question.difficulty === 'easy' ? 'bg-green-100 text-green-800' :
                                  question.difficulty === 'medium' ? 'bg-yellow-100 text-yellow-800' :
                                  'bg-red-100 text-red-800'
                                }`}>
                                  {question.difficulty}
                                </span>
                              </div>
                              <div className="ml-4 flex-shrink-0">
                                <span className="text-xs text-gray-400">
                                  {new Date(question.created_at).toLocaleDateString('nl-NL')}
                                </span>
                              </div>
                            </div>
                          </div>
                        </li>
                      ))}
                    </ul>
                  </div>
                )}

                {activeTab === 'knowledge' && (
                  <div className="bg-white shadow overflow-hidden sm:rounded-md">
                    <div className="px-4 py-5 sm:px-6">
                      <div className="flex justify-between items-center">
                        <div>
                          <h3 className="text-lg leading-6 font-medium text-gray-900">Kennisbank Items</h3>
                          <p className="mt-1 max-w-2xl text-sm text-gray-500">
                            Beheer alle kennisbank items in de database
                          </p>
                        </div>
                        <div className="flex space-x-2">
                          <button
                            onClick={() => refreshContent('articles')}
                            disabled={refreshStatus.articles === 'loading'}
                            className="px-3 py-2 bg-blue-600 text-white text-sm rounded-md hover:bg-blue-700 disabled:opacity-50"
                          >
                            {refreshStatus.articles === 'loading' ? '⏳' : '📄'} Artikelen
                          </button>
                          <button
                            onClick={() => refreshContent('videos')}
                            disabled={refreshStatus.videos === 'loading'}
                            className="px-3 py-2 bg-purple-600 text-white text-sm rounded-md hover:bg-purple-700 disabled:opacity-50"
                          >
                            {refreshStatus.videos === 'loading' ? '⏳' : '🎥'} Video's
                          </button>
                          <button
                            onClick={() => refreshContent('podcasts')}
                            disabled={refreshStatus.podcasts === 'loading'}
                            className="px-3 py-2 bg-orange-600 text-white text-sm rounded-md hover:bg-orange-700 disabled:opacity-50"
                          >
                            {refreshStatus.podcasts === 'loading' ? '⏳' : '🎧'} Podcasts
                          </button>
                          <button
                            onClick={() => refreshContent()}
                            disabled={refreshStatus.all === 'loading'}
                            className="px-3 py-2 bg-green-600 text-white text-sm rounded-md hover:bg-green-700 disabled:opacity-50"
                          >
                            {refreshStatus.all === 'loading' ? '⏳' : '🔄'} Alles
                          </button>
                        </div>
                      </div>
                      {refreshMessage && (
                        <div className={`mt-3 p-3 rounded-md text-sm ${
                          refreshMessage.includes('Fout') 
                            ? 'bg-red-50 text-red-700 border border-red-200' 
                            : 'bg-green-50 text-green-700 border border-green-200'
                        }`}>
                          {refreshMessage}
                        </div>
                      )}
                    </div>
                    <ul className="divide-y divide-gray-200">
                      {knowledgeItems.map((item) => (
                        <li key={item.id}>
                          <div className="px-4 py-4 sm:px-6">
                            <div className="flex items-center justify-between">
                              <div className="flex-1">
                                <div className="flex items-center">
                                  <p className="text-sm font-medium text-gray-900">
                                    {item.title}
                                  </p>
                                  <span className="ml-2 inline-flex px-2 py-1 text-xs font-semibold rounded-full bg-blue-100 text-blue-800">
                                    {item.type}
                                  </span>
                                  <span className={`ml-2 inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                                    item.difficulty === 'easy' ? 'bg-green-100 text-green-800' :
                                    item.difficulty === 'medium' ? 'bg-yellow-100 text-yellow-800' :
                                    'bg-red-100 text-red-800'
                                  }`}>
                                    {item.difficulty}
                                  </span>
                                </div>
                                <p className="mt-1 text-sm text-gray-500 line-clamp-2">
                                  {item.content}
                                </p>
                              </div>
                              <div className="ml-4 flex-shrink-0">
                                <span className="text-xs text-gray-400">
                                  {new Date(item.created_at).toLocaleDateString('nl-NL')}
                                </span>
                              </div>
                            </div>
                          </div>
                        </li>
                      ))}
                    </ul>
                  </div>
                )}
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
