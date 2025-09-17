'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';

export default function TranslatePage() {
  const router = useRouter();

  useEffect(() => {
    // Redirect to search page since we now have combined search & translate
    router.replace('/search');
  }, [router]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <div className="text-center">
        <div className="w-8 h-8 border-4 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
        <p className="text-gray-600">Doorverwijzen naar Zoek & Vertaal...</p>
      </div>
    </div>
  );
}
