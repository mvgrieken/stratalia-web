'use client';

import { useState, useEffect, useCallback, useMemo } from 'react';
import QuizQuestion from '@/components/Quiz/QuizQuestion';
import QuizResult from '@/components/Quiz/QuizResult';
import { LoadingSpinner } from '@/components/LoadingSpinner';
import { ErrorMessage } from '@/components/ErrorMessage';
import { useApi } from '@/hooks/useApi';

interface QuizQuestion {
  id: string;
  word: string;
  question_text: string;
  correct_answer: string;
  wrong_answers: string[];
  difficulty: 'easy' | 'medium' | 'hard';
}

export default function QuizPage() {
  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [selectedAnswer, setSelectedAnswer] = useState<string | null>(null);
  const [score, setScore] = useState(0);
  const [quizCompleted, setQuizCompleted] = useState(false);
  const [startTime, setStartTime] = useState<number>(0);
  const [questionStartTime, setQuestionStartTime] = useState<number>(0);

  // Use the new useApi hook for data fetching
  const { data: quizData, loading, error, execute: fetchQuiz } = useApi<{questions: QuizQuestion[]}>(
    '/api/quiz?difficulty=medium&limit=5',
    'GET'
  );

  const questions = useMemo(() => quizData?.questions || [], [quizData]);

  useEffect(() => {
    fetchQuiz();
  }, [fetchQuiz]);

  const fetchQuizQuestions = useCallback(async () => {
    await fetchQuiz();
    setStartTime(Date.now());
    setQuestionStartTime(Date.now());
  }, [fetchQuiz]);

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
  }, [selectedAnswer, currentQuestion, questions]);

  const handleRestart = useCallback(() => {
    setCurrentQuestion(0);
    setSelectedAnswer(null);
    setScore(0);
    setQuizCompleted(false);
    fetchQuizQuestions();
  }, [fetchQuizQuestions]);

  const handleBackToHome = useCallback(() => {
    window.location.href = '/';
  }, []);

  const timeTaken = useMemo(() => {
    if (startTime === 0) return 0;
    return Math.floor((Date.now() - startTime) / 1000);
  }, [startTime]);

  // Loading state
  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <LoadingSpinner />
          <p className="mt-4 text-gray-600">Quiz vragen worden geladen...</p>
        </div>
      </div>
    );
  }

  // Error state
  if (error) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <ErrorMessage message={error} />
          <button
            onClick={fetchQuizQuestions}
            className="mt-4 px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
          >
            Opnieuw proberen
          </button>
        </div>
      </div>
    );
  }

  // No questions available
  if (questions.length === 0) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-gray-900 mb-4">
            Geen quiz vragen beschikbaar
          </h1>
          <p className="text-gray-600 mb-6">
            Er zijn momenteel geen quiz vragen beschikbaar. Probeer het later opnieuw.
          </p>
          <button
            onClick={fetchQuizQuestions}
            className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
          >
            Opnieuw proberen
          </button>
        </div>
      </div>
    );
  }

  // Quiz completed - show results
  if (quizCompleted) {
    return (
      <div className="min-h-screen bg-gray-50 py-8">
        <QuizResult
          score={score}
          totalQuestions={questions.length}
          timeTaken={timeTaken}
          onRestart={handleRestart}
          onBackToHome={handleBackToHome}
        />
      </div>
    );
  }

  // Show current question
  const currentQuestionData = questions[currentQuestion];
  if (!currentQuestionData) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <ErrorMessage message="Quiz vraag niet gevonden" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      {/* Quiz Header */}
      <div className="max-w-4xl mx-auto px-4 mb-8">
        <div className="text-center mb-6">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            Straattaal Quiz
          </h1>
          <p className="text-gray-600">
            Test je kennis van Nederlandse straattaal
          </p>
        </div>

        {/* Progress Bar */}
        <div className="mb-6">
          <div className="flex justify-between text-sm text-gray-600 mb-2">
            <span>Vraag {currentQuestion + 1} van {questions.length}</span>
            <span>Score: {score}/{questions.length}</span>
          </div>
          <div className="w-full bg-gray-200 rounded-full h-2">
            <div
              className="bg-blue-600 h-2 rounded-full transition-all duration-300"
              style={{ width: `${((currentQuestion + 1) / questions.length) * 100}%` }}
            />
          </div>
        </div>
      </div>

      {/* Question Component */}
      <QuizQuestion
        question={currentQuestionData}
        selectedAnswer={selectedAnswer}
        onAnswerSelect={handleAnswerSelect}
        onNext={handleNextQuestion}
        isLastQuestion={currentQuestion === questions.length - 1}
      />
    </div>
  );
}