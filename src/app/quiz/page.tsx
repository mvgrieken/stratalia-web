'use client';

import { useState, useEffect } from 'react';

interface QuizQuestion {
  id: string;
  word: string;
  definition: string;
  example?: string;
  correct_answer: string;
  wrong_answers: string[];
  difficulty: 'easy' | 'medium' | 'hard';
  mastery_score?: number;
}

interface _QuizResult {
  score: number;
  total: number;
  time_taken: number;
  adaptive_feedback?: {
    next_difficulty: string;
    recommended_words: string[];
    learning_path: string[];
    mastery_score: number;
  };
}

export default function QuizPage() {
  const [questions, setQuestions] = useState<QuizQuestion[]>([]);
  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [selectedAnswer, setSelectedAnswer] = useState<string | null>(null);
  const [_showResult, setShowResult] = useState(false);
  const [score, setScore] = useState(0);
  const [quizCompleted, setQuizCompleted] = useState(false);
  const [loading, setLoading] = useState(true);
  const [startTime, setStartTime] = useState<number>(0);
  const [questionStartTime, setQuestionStartTime] = useState<number>(0);
  const [adaptiveFeedback, setAdaptiveFeedback] = useState<any>(null);

  useEffect(() => {
    fetchQuizQuestions();
  }, []);

  const fetchQuizQuestions = async () => {
    try {
      // Use the dedicated quiz API endpoint
      const response = await fetch('/api/quiz?difficulty=medium&limit=5');
      if (response.ok) {
        const data = await response.json();
        const quizQuestions: QuizQuestion[] = data.questions.map((q: any) => ({
          id: q.id,
          word: q.word,
          definition: q.correct_answer,
          example: q.example,
          correct_answer: q.correct_answer,
          wrong_answers: q.wrong_answers || [],
          difficulty: q.difficulty || 'medium'
        }));

        setQuestions(quizQuestions);
        setStartTime(Date.now());
        setQuestionStartTime(Date.now());
      } else {
        console.error('Failed to fetch quiz questions:', response.status);
        // Fallback to search API
        const fallbackResponse = await fetch('/api/words/search?query=a&limit=20');
        if (fallbackResponse.ok) {
          const words = await fallbackResponse.json();
          
          const quizQuestions: QuizQuestion[] = words.slice(0, 5).map((word: any) => {
            const otherWords = words.filter((w: any) => w.id !== word.id);
            const wrongAnswers = otherWords
              .sort(() => 0.5 - Math.random())
              .slice(0, 3)
              .map((w: any) => w.meaning);

            return {
              id: word.id,
              word: word.word,
              definition: word.meaning,
              example: word.example,
              correct_answer: word.meaning,
              wrong_answers: wrongAnswers,
              difficulty: 'medium'
            };
          });

          setQuestions(quizQuestions);
          setStartTime(Date.now());
          setQuestionStartTime(Date.now());
        }
      }
    } catch (error) {
      console.error('Error fetching quiz questions:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleAnswerSelect = (answer: string) => {
    setSelectedAnswer(answer);
  };

  const handleNextQuestion = async () => {
    const isCorrect = selectedAnswer === questions[currentQuestion].correct_answer;
    if (isCorrect) {
      setScore(score + 1);
    }

    // Send adaptive learning data
    const responseTime = Date.now() - questionStartTime;
    await sendAdaptiveLearningData(questions[currentQuestion], responseTime, isCorrect);

    if (currentQuestion < questions.length - 1) {
      setCurrentQuestion(currentQuestion + 1);
      setSelectedAnswer(null);
      setShowResult(false);
      setQuestionStartTime(Date.now());
    } else {
      // Quiz completed
      const timeTaken = Math.round((Date.now() - startTime) / 1000);
      setQuizCompleted(true);
      
      // Save quiz result
      saveQuizResult(score + (isCorrect ? 1 : 0), questions.length, timeTaken);
    }
  };

  const sendAdaptiveLearningData = async (question: QuizQuestion, responseTime: number, correct: boolean) => {
    try {
      const response = await fetch('/api/ai/learning', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          word_id: question.id,
          difficulty: question.difficulty,
          response_time: responseTime,
          correct: correct,
          attempts: 1 // For now, assume single attempt
        }),
      });

      if (response.ok) {
        const feedback = await response.json();
        setAdaptiveFeedback(feedback);
      }
    } catch (error) {
      console.error('Error sending adaptive learning data:', error);
    }
  };

  const saveQuizResult = async (finalScore: number, totalQuestions: number, timeTaken: number) => {
    try {
      await fetch('/api/quiz/submit', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          score: finalScore,
          total_questions: totalQuestions,
          time_taken: timeTaken,
          difficulty: 'medium'
        }),
      });
    } catch (error) {
      console.error('Error saving quiz result:', error);
    }
  };

  const resetQuiz = () => {
    setCurrentQuestion(0);
    setSelectedAnswer(null);
    setShowResult(false);
    setScore(0);
    setQuizCompleted(false);
    setLoading(true);
    fetchQuizQuestions();
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Quiz wordt geladen...</p>
        </div>
      </div>
    );
  }

  if (quizCompleted) {
    const finalScore = score + (selectedAnswer === questions[currentQuestion]?.correct_answer ? 1 : 0);
    const percentage = Math.round((finalScore / questions.length) * 100);
    const timeTaken = Math.round((Date.now() - startTime) / 1000);

    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="max-w-md mx-auto bg-white rounded-lg shadow-lg p-8 text-center">
          <div className="text-6xl mb-4">
            {percentage >= 80 ? '🎉' : percentage >= 60 ? '👍' : '💪'}
          </div>
          <h1 className="text-3xl font-bold text-gray-900 mb-4">Quiz Voltooid!</h1>
          <div className="space-y-4">
            <div className="text-4xl font-bold text-blue-600">
              {finalScore}/{questions.length}
            </div>
            <p className="text-xl text-gray-700">
              {percentage}% correct
            </p>
            <p className="text-gray-600">
              Tijd: {Math.floor(timeTaken / 60)}:{(timeTaken % 60).toString().padStart(2, '0')}
            </p>
            {/* Adaptive Learning Feedback */}
            {adaptiveFeedback && (
              <div className="mt-6 bg-gradient-to-r from-purple-50 to-blue-50 border border-purple-200 rounded-lg p-4">
                <h4 className="font-semibold text-purple-900 mb-3">🤖 AI Leeradvies</h4>
                <div className="space-y-2 text-sm">
                  <p><strong>Volgende moeilijkheid:</strong> {adaptiveFeedback.next_difficulty}</p>
                  <p><strong>Beheersingsscore:</strong> {Math.round(adaptiveFeedback.mastery_score * 100)}%</p>
                  {adaptiveFeedback.recommended_words.length > 0 && (
                    <p><strong>Aanbevolen woorden:</strong> {adaptiveFeedback.recommended_words.join(', ')}</p>
                  )}
                </div>
              </div>
            )}

            <div className="mt-6">
              <button
                onClick={resetQuiz}
                className="bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 mr-4"
              >
                Opnieuw Spelen
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
      </div>
    );
  }

  const question = questions[currentQuestion];
  
  // Check if question exists
  if (!question) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <p className="text-gray-600">Geen vragen beschikbaar</p>
        </div>
      </div>
    );
  }
  
  const allAnswers = [question.correct_answer, ...question.wrong_answers].sort(() => 0.5 - Math.random());

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="container mx-auto px-4 py-8">
        <div className="max-w-2xl mx-auto">
          {/* Progress Bar */}
          <div className="mb-8">
            <div className="flex justify-between items-center mb-2">
              <span className="text-sm text-gray-600">Vraag {currentQuestion + 1} van {questions.length}</span>
              <span className="text-sm text-gray-600">{score} punten</span>
            </div>
            <div className="w-full bg-gray-200 rounded-full h-2">
              <div 
                className="bg-blue-600 h-2 rounded-full transition-all duration-300"
                style={{ width: `${((currentQuestion + 1) / questions.length) * 100}%` }}
              ></div>
            </div>
          </div>

          {/* Question */}
          <div className="bg-white rounded-lg shadow-lg p-8 mb-8">
            <h2 className="text-3xl font-bold text-center text-gray-900 mb-6">
              Wat betekent "{question.word}"?
            </h2>
            
            {question.example && (
              <div className="bg-gray-50 rounded-lg p-4 mb-6">
                <p className="text-sm text-gray-600 mb-1">Voorbeeld:</p>
                <p className="text-gray-800 italic">"{question.example}"</p>
              </div>
            )}

            {/* Answer Options */}
            <div className="space-y-3">
              {allAnswers.map((answer, index) => (
                <button
                  key={index}
                  onClick={() => handleAnswerSelect(answer)}
                  className={`w-full p-4 text-left rounded-lg border-2 transition-all ${
                    selectedAnswer === answer
                      ? 'border-blue-500 bg-blue-50'
                      : 'border-gray-200 hover:border-gray-300'
                  }`}
                >
                  <span className="font-medium">{answer}</span>
                </button>
              ))}
            </div>

            {/* Next Button */}
            {selectedAnswer && (
              <div className="mt-6 text-center">
                <button
                  onClick={handleNextQuestion}
                  className="bg-blue-600 text-white px-8 py-3 rounded-lg hover:bg-blue-700 font-medium"
                >
                  {currentQuestion < questions.length - 1 ? 'Volgende Vraag' : 'Bekijk Resultaat'}
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
