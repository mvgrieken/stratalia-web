'use client';

export default function HomePage() {
  return (
    <div className="min-h-screen bg-gray-50">
      <div className="flex flex-col items-center justify-center min-h-screen px-6">
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-gray-900 mb-4">
            Straatpraat
          </h1>
          <p className="text-xl text-gray-600 mb-8">
            Leer straattaal op een leuke en interactieve manier
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 w-full max-w-4xl">
          <div className="bg-white rounded-lg shadow-md p-6 text-center">
            <div className="text-4xl mb-4">🔤</div>
            <h3 className="text-xl font-semibold mb-2">Vertalen</h3>
            <p className="mb-4 text-gray-600">
              Vertaal straattaalwoorden naar het Nederlands en andersom
            </p>
            <button 
              className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
              onClick={() => console.log('Vertalen clicked')}
            >
              Probeer het
            </button>
          </div>

          <div className="bg-white rounded-lg shadow-md p-6 text-center">
            <div className="text-4xl mb-4">📅</div>
            <h3 className="text-xl font-semibold mb-2">Woord van de Dag</h3>
            <p className="mb-4 text-gray-600">
              Leer elke dag een nieuw straattaalwoord
            </p>
            <button 
              className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
              onClick={() => console.log('Woord van de Dag clicked')}
            >
              Bekijk
            </button>
          </div>

          <div className="bg-white rounded-lg shadow-md p-6 text-center">
            <div className="text-4xl mb-4">🧠</div>
            <h3 className="text-xl font-semibold mb-2">Quiz</h3>
            <p className="mb-4 text-gray-600">
              Test je kennis en verdien punten
            </p>
            <button 
              className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
              onClick={() => console.log('Quiz clicked')}
            >
              Start Quiz
            </button>
          </div>

          <div className="bg-white rounded-lg shadow-md p-6 text-center">
            <div className="text-4xl mb-4">📚</div>
            <h3 className="text-xl font-semibold mb-2">Kennisbank</h3>
            <p className="mb-4 text-gray-600">
              Verdiep je kennis met artikelen en podcasts
            </p>
            <button 
              className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
              onClick={() => console.log('Kennisbank clicked')}
            >
              Verken
            </button>
          </div>

          <div className="bg-white rounded-lg shadow-md p-6 text-center">
            <div className="text-4xl mb-4">👥</div>
            <h3 className="text-xl font-semibold mb-2">Community</h3>
            <p className="mb-4 text-gray-600">
              Draag bij aan de straattaal database
            </p>
            <button 
              className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
              onClick={() => console.log('Community clicked')}
            >
              Doe mee
            </button>
          </div>

          <div className="bg-white rounded-lg shadow-md p-6 text-center">
            <div className="text-4xl mb-4">📱</div>
            <h3 className="text-xl font-semibold mb-2">Download App</h3>
            <p className="mb-4 text-gray-600">
              Krijg de volledige ervaring op je telefoon
            </p>
            <button 
              className="border border-blue-600 text-blue-600 px-4 py-2 rounded hover:bg-blue-50"
              onClick={() => console.log('Download clicked')}
            >
              Download
            </button>
          </div>
        </div>

        <div className="mt-12 text-center">
          <p className="text-gray-500">
            Beschikbaar voor iOS, Android en Web
          </p>
        </div>
      </div>
    </div>
  )
}
