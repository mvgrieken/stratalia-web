'use client';

interface ErrorStateProps {
  error: string;
}

export default function ErrorState({ error }: ErrorStateProps) {
  return (
    <div className="text-center">
      <div className="text-red-500 text-6xl mb-4">⚠️</div>
      <h1 className="text-2xl font-bold text-gray-900 mb-2">Fout bij laden</h1>
      <p className="text-gray-600 mb-4">{error}</p>
      <button
        onClick={() => window.location.reload()}
        className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700"
      >
        Opnieuw proberen
      </button>
    </div>
  );
}
