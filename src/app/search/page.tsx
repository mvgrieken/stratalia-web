import SearchAndTranslate from '@/components/SearchAndTranslate';

export default function SearchPage() {
  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 py-8">
      <div className="max-w-4xl mx-auto px-6">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-gray-900 dark:text-gray-100 mb-4">
            📚 Straattaal Woordenboek
          </h1>
          <p className="text-lg text-gray-600 dark:text-gray-300 max-w-2xl mx-auto">
            Zoek en vertaal straattaal woorden, bekijk uitgebreide details en voeg nieuwe woorden toe aan onze community database.
          </p>
        </div>
        <SearchAndTranslate />
      </div>
    </div>
  );
}
