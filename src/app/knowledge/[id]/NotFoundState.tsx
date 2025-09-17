'use client';

import { useRouter } from 'next/navigation';

interface NotFoundStateProps {
  error?: string | null;
}

export default function NotFoundState({ error }: NotFoundStateProps) {
  const router = useRouter();

  return (
    <div className="text-center max-w-md mx-auto">
      <div className="text-6xl mb-4">😕</div>
      <h1 className="text-2xl font-bold text-gray-900 mb-4">Item niet gevonden</h1>
      <p className="text-gray-600 mb-6">
        {error || 'Het gevraagde item kon niet worden gevonden.'}
      </p>
      <button
        onClick={() => router.push('/knowledge')}
        className="bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700"
      >
        Terug naar Kennisbank
      </button>
    </div>
  );
}
