/**
 * Quiz result component
 * Shows final score and feedback
 */

import React, { memo } from 'react';

interface QuizResultProps {
  score: number;
  totalQuestions: number;
  timeTaken: number;
  onRestart: () => void;
  onBackToHome: () => void;
}

const QuizResult = memo<QuizResultProps>(({
  score,
  totalQuestions,
  timeTaken,
  onRestart,
  onBackToHome
}) => {
  const percentage = Math.round((score / totalQuestions) * 100);
  
  const getScoreColor = (percentage: number) => {
    if (percentage >= 80) return 'text-green-600';
    if (percentage >= 60) return 'text-yellow-600';
    return 'text-red-600';
  };

  const getScoreMessage = (percentage: number) => {
    if (percentage >= 90) return 'Uitstekend! Je bent een straattaal expert!';
    if (percentage >= 80) return 'Goed gedaan! Je kent je straattaal goed.';
    if (percentage >= 60) return 'Niet slecht! Er is nog ruimte voor verbetering.';
    if (percentage >= 40) return 'Je bent op de goede weg! Blijf oefenen.';
    return 'Niet opgeven! Straattaal leren kost tijd.';
  };

  const getScoreEmoji = (percentage: number) => {
    if (percentage >= 90) return '🎉';
    if (percentage >= 80) return '👏';
    if (percentage >= 60) return '👍';
    if (percentage >= 40) return '💪';
    return '📚';
  };

  const formatTime = (seconds: number) => {
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = seconds % 60;
    return minutes > 0 ? `${minutes}m ${remainingSeconds}s` : `${remainingSeconds}s`;
  };

  return (
    <div className="max-w-2xl mx-auto p-6 bg-white rounded-lg shadow-lg text-center">
      {/* Result Header */}
      <div className="mb-8">
        <div className="text-6xl mb-4">
          {getScoreEmoji(percentage)}
        </div>
        <h2 className="text-3xl font-bold text-gray-900 mb-2">
          Quiz Voltooid!
        </h2>
        <p className="text-lg text-gray-600">
          {getScoreMessage(percentage)}
        </p>
      </div>

      {/* Score Display */}
      <div className="mb-8">
        <div className={`text-6xl font-bold mb-2 ${getScoreColor(percentage)}`}>
          {percentage}%
        </div>
        <div className="text-xl text-gray-700">
          {score} van {totalQuestions} vragen correct
        </div>
        <div className="text-sm text-gray-500 mt-2">
          Tijd: {formatTime(timeTaken)}
        </div>
      </div>

      {/* Progress Bar */}
      <div className="mb-8">
        <div className="w-full bg-gray-200 rounded-full h-3">
          <div
            className={`h-3 rounded-full transition-all duration-1000 ${
              percentage >= 80 ? 'bg-green-500' :
              percentage >= 60 ? 'bg-yellow-500' : 'bg-red-500'
            }`}
            style={{ width: `${percentage}%` }}
          />
        </div>
      </div>

      {/* Action Buttons */}
      <div className="flex flex-col sm:flex-row gap-4 justify-center">
        <button
          onClick={onRestart}
          className="px-6 py-3 bg-blue-600 text-white rounded-lg font-medium hover:bg-blue-700 transition-colors"
        >
          Opnieuw Proberen
        </button>
        <button
          onClick={onBackToHome}
          className="px-6 py-3 bg-gray-600 text-white rounded-lg font-medium hover:bg-gray-700 transition-colors"
        >
          Terug naar Home
        </button>
      </div>

      {/* Tips */}
      <div className="mt-8 p-4 bg-blue-50 rounded-lg">
        <h3 className="font-medium text-blue-900 mb-2">💡 Tips om beter te worden:</h3>
        <ul className="text-sm text-blue-800 space-y-1">
          <li>• Lees dagelijks het woord van de dag</li>
          <li>• Bekijk de kennisbank voor meer context</li>
          <li>• Praat met vrienden over straattaal</li>
          <li>• Luister naar Nederlandse rap en hip-hop</li>
        </ul>
      </div>
    </div>
  );
});

QuizResult.displayName = 'QuizResult';

export default QuizResult;
