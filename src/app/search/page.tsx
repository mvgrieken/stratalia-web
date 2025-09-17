import SearchAndTranslate from '@/components/SearchAndTranslate';
import Navigation from '@/components/Navigation';

export default function SearchPage() {
  return (
    <>
      <Navigation />
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 py-8">
        <div className="max-w-4xl mx-auto px-6">
          <h1 className="text-3xl font-bold text-gray-900 dark:text-gray-100 mb-6">
            Zoek & Vertaal
          </h1>
          <SearchAndTranslate />
        </div>
      </div>
    </>
  );
}
