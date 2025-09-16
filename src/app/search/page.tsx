import SearchClient from './SearchClient';
import Navigation from '@/components/Navigation';

export default function SearchPage() {
  return (
    <>
      <Navigation />
      <div className="min-h-screen bg-gray-50 py-8">
        <div className="max-w-4xl mx-auto px-6">
          <h1 className="text-3xl font-bold text-gray-900 mb-6">
            Zoeken
          </h1>
          <SearchClient />
        </div>
      </div>
    </>
  );
}
