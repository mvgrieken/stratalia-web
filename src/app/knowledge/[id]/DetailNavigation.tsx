'use client';

interface DetailNavigationProps {
  onBackToKnowledge: () => void;
  onGoHome: () => void;
}

export default function DetailNavigation({ onBackToKnowledge, onGoHome }: DetailNavigationProps) {
  return (
    <nav className="mb-6">
      <ol className="flex items-center space-x-2 text-sm text-gray-500">
        <li>
          <button
            onClick={onGoHome}
            className="hover:text-gray-700 transition-colors"
          >
            Home
          </button>
        </li>
        <li className="text-gray-400">/</li>
        <li>
          <button
            onClick={onBackToKnowledge}
            className="hover:text-gray-700 transition-colors"
          >
            Kennisbank
          </button>
        </li>
      </ol>
    </nav>
  );
}
