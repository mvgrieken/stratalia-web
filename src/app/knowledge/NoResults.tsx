'use client';

interface NoResultsProps {
  onClearFilters: () => void;
}

export default function NoResults({ onClearFilters }: NoResultsProps) {
  return (
    <div className="text-center py-12">
      <div className="text-gray-400 text-6xl mb-4">🔍</div>
      <h3 className="text-xl font-semibold text-gray-900 mb-2">
        Geen resultaten gevonden
      </h3>
      <p className="text-gray-600 mb-4">
        Probeer andere zoektermen of filters te gebruiken.
      </p>
      <button
        onClick={onClearFilters}
        className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700"
      >
        Alle filters wissen
      </button>
    </div>
  );
}
