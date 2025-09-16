'use client';

import { useState, useEffect, useCallback, useMemo } from 'react';
import QuizQuestionComponent from '@/components/Quiz/QuizQuestion';
import QuizResult from '@/components/Quiz/QuizResult';
import { LoadingSpinner } from '@/components/LoadingSpinner';
import { ErrorMessage } from '@/components/ErrorMessage';
import { useApi } from '@/hooks/useApi';
import Navigation from '@/components/Navigation';

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

  // Use the new useApi hook for data fetching
  const { data: quizData, loading, error, execute: fetchQuiz } = useApi<{questions: QuizQuestion[]}>(
    () => fetch('/api/quiz?difficulty=medium&limit=5').then(res => res.json())
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
    fetchQuiz();
  }, [fetchQuiz]);

  if (loading) {
    return (
      <>
        <Navigation />
        <div className="min-h-screen flex items-center justify-center bg-gray-50">
          <div className="text-center">
            <LoadingSpinner />
            <p className="mt-4 text-gray-600">Quiz wordt geladen...</p>
          </div>
        </div>
      </>
    );
  }

  if (error) {
    return (
      <>
        <Navigation />
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
      </>
    );
  }

  if (questions.length === 0) {
    return (
      <>
        <Navigation />
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
      </>
    );
  }

  if (quizCompleted) {
    const timeTaken = Math.round((Date.now() - startTime) / 1000);
    const percentage = Math.round((score / questions.length) * 100);

    return (
      <>
        <Navigation />
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
      </>
    );
  }

  const currentQuestionData = questions[currentQuestion];

  return (
    <>
      <Navigation />
      <div className="min-h-screen bg-gray-50 py-8">
        <div className="max-w-4xl mx-auto px-4">
        {/* Quiz Header */}
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            🧠 Straattaal Quiz
          </h1>
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
    </>
  );
}
