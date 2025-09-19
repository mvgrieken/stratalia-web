'use client';

import { useState, useEffect, useCallback } from 'react';
import { logger } from '@/lib/logger';
import QuizQuestionComponent from '@/components/Quiz/QuizQuestion';
import QuizResult from '@/components/Quiz/QuizResult';
import { LoadingSpinner } from '@/components/LoadingSpinner';
import { ErrorMessage } from '@/components/ErrorMessage';

interface QuizQuestion {
  id: string;
  word: string;
  question_text: string;
  correct_answer: string;
  wrong_answers: string[];
  difficulty: 'easy' | 'medium' | 'hard';
}

export default function LazyQuizPage() {
  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [selectedAnswer, setSelectedAnswer] = useState<string | null>(null);
  const [score, setScore] = useState(0);
  const [quizCompleted, setQuizCompleted] = useState(false);
  const [startTime, setStartTime] = useState<number>(0);
  const [, setQuestionStartTime] = useState<number>(0);

  const [questions, setQuestions] = useState<QuizQuestion[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [difficulty, setDifficulty] = useState<'easy' | 'medium' | 'hard'>('medium');
  const [previewMode, setPreviewMode] = useState<boolean>(false);

  const fetchQuizQuestions = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const limit = previewMode ? 3 : 5;
      const response = await fetch(`/api/quiz?difficulty=${difficulty}&limit=${limit}`);
      if (response.ok) {
        const data = await response.json();
        setQuestions(data.data?.questions || []);
        setStartTime(Date.now());
        setQuestionStartTime(Date.now());
      } else {
        setError('Kon quiz vragen niet laden');
      }
    } catch (err) {
      logger.error(`Error fetching quiz questions: ${err}`);
      setError('Er is een fout opgetreden bij het laden van de quiz');
    } finally {
      setLoading(false);
    }
  }, [difficulty, previewMode]);

  useEffect(() => {
    fetchQuizQuestions();
  }, [fetchQuizQuestions]);

  const handleAnswerSelect = useCallback((answer: string) => {
    setSelectedAnswer(answer);
  }, []);

  const handleNextQuestion = useCallback(() => {
    if (selectedAnswer === questions[currentQuestion]?.correct_answer) {
      setScore(prev => prev + 1);
    }

    if (currentQuestion < questions.length - 1) {
      setCurrentQuestion(prev => prev + 1);
      setSelectedAnswer(null);
      setQuestionStartTime(Date.now());
    } else {
      setQuizCompleted(true);
    }
  }, [selectedAnswer, questions, currentQuestion]);

  const handleRestart = useCallback(() => {
    setCurrentQuestion(0);
    setSelectedAnswer(null);
    setScore(0);
    setQuizCompleted(false);
    setStartTime(0);
    setQuestionStartTime(0);
    fetchQuizQuestions();
  }, [fetchQuizQuestions]);

  const handleRetry = useCallback(() => {
    fetchQuizQuestions();
  }, [fetchQuizQuestions]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <LoadingSpinner />
          <p className="mt-4 text-gray-600">Quiz wordt geladen...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
          <div className="text-center max-w-md mx-auto">
            <ErrorMessage message="Er is een fout opgetreden bij het laden van de quiz" />
            <button
              onClick={handleRetry}
              className="mt-4 px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
            >
              Opnieuw proberen
            </button>
          </div>
        </div>
    );
  }

  if (questions.length === 0) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
          <div className="text-center">
            <p className="text-gray-600">Geen quiz vragen beschikbaar</p>
            <button
              onClick={handleRetry}
              className="mt-4 px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
            >
              Opnieuw proberen
            </button>
          </div>
        </div>
    );
  }

  if (quizCompleted) {
    const timeTaken = Math.round((Date.now() - startTime) / 1000);

    return (
      <div className="min-h-screen bg-gray-50 py-8">
        <div className="max-w-2xl mx-auto px-4">
          <QuizResult
            score={score}
            totalQuestions={questions.length}
            timeTaken={timeTaken}
            onRestart={handleRestart}
            onBackToHome={() => window.location.href = '/'}
          />
        </div>
      </div>
    );
  }

  const currentQuestionData = questions[currentQuestion];

  return (
    <div className="min-h-screen bg-gray-50 py-8">
        <div className="max-w-4xl mx-auto px-4">
        {/* Quiz Header */}
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            🧠 Straattaal Quiz
          </h1>
          {/* Controls */}
          <div className="flex items-center justify-center gap-4 mb-4">
            <label className="text-sm text-gray-700">
              Moeilijkheid:
              <select
                value={difficulty}
                onChange={(e) => setDifficulty(e.target.value as 'easy' | 'medium' | 'hard')}
                className="ml-2 px-2 py-1 border rounded"
              >
                <option value="easy">Makkelijk</option>
                <option value="medium">Gemiddeld</option>
                <option value="hard">Moeilijk</option>
              </select>
            </label>
            <label className="text-sm text-gray-700 inline-flex items-center gap-2">
              <input
                type="checkbox"
                checked={previewMode}
                onChange={(e) => setPreviewMode(e.target.checked)}
                className="h-4 w-4"
              />
              Voorbeeld (3 vragen)
            </label>
            <button
              onClick={fetchQuizQuestions}
              className="px-3 py-1 bg-blue-600 text-white text-sm rounded hover:bg-blue-700"
            >
              Vernieuwen
            </button>
          </div>
          <p className="text-gray-600">
            Vraag {currentQuestion + 1} van {questions.length}
          </p>
          <div className="mt-4 w-full bg-gray-200 rounded-full h-2">
            <div
              className="bg-blue-600 h-2 rounded-full transition-all duration-300"
              style={{ width: `${((currentQuestion + 1) / questions.length) * 100}%` }}
            ></div>
          </div>
        </div>

        {/* Question Component */}
        <QuizQuestionComponent
          question={currentQuestionData}
          selectedAnswer={selectedAnswer}
          onAnswerSelect={handleAnswerSelect}
          onNext={handleNextQuestion}
          isLastQuestion={currentQuestion === questions.length - 1}
          disabled={false}
        />

        {/* Quiz Info */}
        <div className="mt-8 text-center text-sm text-gray-500">
          <p>Kies het juiste antwoord en klik op "Volgende Vraag"</p>
        </div>
        </div>
      </div>
  );
}
