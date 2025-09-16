/**
 * Individual quiz question component
 * Extracted from large QuizPage component for better maintainability
 */

import React, { memo, useCallback } from 'react';

interface QuizQuestionProps {
  question: {
    id: string;
    word: string;
    question_text: string;
    correct_answer: string;
    wrong_answers: string[];
    difficulty: 'easy' | 'medium' | 'hard';
  };
  selectedAnswer: string | null;
  onAnswerSelect: (answer: string) => void;
  onNext: () => void;
  isLastQuestion: boolean;
  disabled?: boolean;
}

const QuizQuestion = memo<QuizQuestionProps>(({
  question,
  selectedAnswer,
  onAnswerSelect,
  onNext,
  isLastQuestion,
  disabled = false
}) => {
  const handleAnswerClick = useCallback((_answer: string) => {
    if (!disabled) {
      onAnswerSelect(_answer);
    }
  }, [onAnswerSelect, disabled]);

  const handleNextClick = useCallback(() => {
    if (!disabled && selectedAnswer) {
      onNext();
    }
  }, [onNext, selectedAnswer, disabled]);

  // Shuffle answers to avoid always showing correct answer first
  const allAnswers = React.useMemo(() => {
    const answers = [question.correct_answer, ...question.wrong_answers];
    return answers.sort(() => Math.random() - 0.5);
  }, [question.correct_answer, question.wrong_answers]);

  const getDifficultyColor = (difficulty: string) => {
    switch (difficulty) {
      case 'easy': return 'bg-green-100 text-green-800';
      case 'medium': return 'bg-yellow-100 text-yellow-800';
      case 'hard': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getDifficultyLabel = (difficulty: string) => {
    switch (difficulty) {
      case 'easy': return 'Makkelijk';
      case 'medium': return 'Gemiddeld';
      case 'hard': return 'Moeilijk';
      default: return 'Onbekend';
    }
  };

  return (
    <div className="max-w-2xl mx-auto p-6 bg-white rounded-lg shadow-lg">
      {/* Question Header */}
      <div className="mb-6">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-2xl font-bold text-gray-900">
            {question.word}
          </h2>
          <span className={`px-3 py-1 rounded-full text-sm font-medium ${getDifficultyColor(question.difficulty)}`}>
            {getDifficultyLabel(question.difficulty)}
          </span>
        </div>
        <p className="text-lg text-gray-700">
          {question.question_text}
        </p>
      </div>

      {/* Answer Options */}
      <div className="space-y-3 mb-6">
        {allAnswers.map((answer, index) => {
          const isSelected = selectedAnswer === answer;
          const isCorrect = answer === question.correct_answer;
          
          let buttonClass = "w-full p-4 text-left rounded-lg border-2 transition-all duration-200 ";
          
          if (disabled && selectedAnswer) {
            if (isCorrect) {
              buttonClass += "border-green-500 bg-green-50 text-green-800";
            } else if (isSelected) {
              buttonClass += "border-red-500 bg-red-50 text-red-800";
            } else {
              buttonClass += "border-gray-200 bg-gray-50 text-gray-500";
            }
          } else if (isSelected) {
            buttonClass += "border-blue-500 bg-blue-50 text-blue-800";
          } else {
            buttonClass += "border-gray-200 bg-white hover:border-blue-300 hover:bg-blue-50";
          }

          return (
            <button
              key={index}
              onClick={() => handleAnswerClick(answer)}
              disabled={disabled}
              className={buttonClass}
            >
              <div className="flex items-center">
                <span className="flex-shrink-0 w-6 h-6 rounded-full border-2 border-current flex items-center justify-center text-sm font-medium mr-3">
                  {String.fromCharCode(65 + index)}
                </span>
                <span className="flex-1">{answer}</span>
                {disabled && selectedAnswer && isCorrect && (
                  <span className="text-green-600">✓</span>
                )}
                {disabled && selectedAnswer && isSelected && !isCorrect && (
                  <span className="text-red-600">✗</span>
                )}
              </div>
            </button>
          );
        })}
      </div>

      {/* Next Button */}
      {selectedAnswer && (
        <div className="flex justify-center">
          <button
            onClick={handleNextClick}
            disabled={disabled}
            className="px-8 py-3 bg-blue-600 text-white rounded-lg font-medium hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          >
            {isLastQuestion ? 'Bekijk Resultaat' : 'Volgende Vraag'}
          </button>
        </div>
      )}
    </div>
  );
});

QuizQuestion.displayName = 'QuizQuestion';

export default QuizQuestion;
