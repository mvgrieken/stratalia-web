# Stratalia - Nederlandse Straattaal Leerplatform

Een modern, interactief platform voor het leren van Nederlandse straattaal met AI-vertaling, quizzen, en community features.

## 🚀 Features

- **AI Vertalen**: Bidirectionele vertaling tussen straattaal en standaard Nederlands
- **Zoeken**: Uitgebreide zoekfunctie met fallback data
- **Woord van de Dag**: Dagelijks nieuwe straattaalwoorden
- **Quiz**: Interactieve quizzen met verschillende moeilijkheidsgraden
- **Kennisbank**: Artikelen, video's, podcasts en infographics
- **Leaderboard**: Gamification met punten, levels en streaks
- **Community**: Gebruikers kunnen woorden toevoegen en beoordelen
- **Mobile App**: Expo/React Native app met offline functionaliteit

## 🛠️ Tech Stack

- **Frontend**: Next.js 15, React 18, TypeScript
- **Backend**: Next.js API Routes, Supabase
- **Database**: PostgreSQL (via Supabase)
- **Authentication**: Supabase Auth
- **Mobile**: Expo, React Native
- **Styling**: Tailwind CSS
- **Deployment**: Vercel

## 📋 Vereisten

- Node.js 18+ 
- npm of yarn
- Supabase account (optioneel - app werkt met fallback data)

## 🚀 Installatie

1. **Clone de repository**
   ```bash
   git clone https://github.com/mvgrieken/stratalia-web.git
   cd stratalia-web
   ```

2. **Installeer dependencies**
   ```bash
   npm install
   ```

3. **Configureer environment variabelen**
   ```bash
   cp env.example .env.local
   ```
   
   Vul de volgende variabelen in:
   ```env
   NEXT_PUBLIC_SUPABASE_URL=your_supabase_project_url
   NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
   SUPABASE_SERVICE_ROLE_KEY=your_supabase_service_role_key
   NEXT_PUBLIC_APP_URL=https://stratalia.nl
   NEXT_PUBLIC_APP_NAME=Stratalia
   NODE_ENV=development
   ```

4. **Start de development server**
   ```bash
   npm run dev
   ```

5. **Open de app**
   Navigeer naar [http://localhost:3000](http://localhost:3000)

## 📱 Mobile App

De mobile app bevindt zich in de `stratalia-mobile` directory:

```bash
cd stratalia-mobile
npm install
npx expo start
```

## 🧪 Testing

### Unit Tests
```bash
npm run test
```

### Linting
```bash
npm run lint
```

### Type Checking
```bash
npm run build
```

### E2E Tests
```bash
npm run test:e2e
```

## 🏗️ Build & Deployment

### Development Build
```bash
npm run build
npm run start
```

### Production Deployment (Vercel)
```bash
npm run build
vercel --prod
```

## 📁 Project Structuur

```
stratalia-web/
├── src/
│   ├── app/                 # Next.js App Router
│   │   ├── api/            # API Routes
│   │   ├── (pages)/        # Frontend pages
│   │   └── globals.css     # Global styles
│   ├── components/         # React components
│   ├── hooks/             # Custom React hooks
│   ├── lib/               # Utilities & config
│   └── __tests__/         # Test files
├── stratalia-mobile/       # Expo mobile app
├── public/                # Static assets
└── docs/                  # Documentation
```

## 🔧 API Endpoints

### Core APIs
- `GET /api/words/search` - Zoek straattaalwoorden
- `POST /api/ai/translate` - AI vertaling
- `GET /api/words/daily` - Woord van de dag
- `GET /api/quiz` - Quiz vragen
- `GET /api/content/approved` - Kennisbank content

### Gamification
- `GET /api/gamification/leaderboard` - Leaderboard
- `GET /api/gamification/challenges` - Challenges
- `POST /api/gamification/points` - Punten toekennen

### Authentication
- `POST /api/auth/login` - Inloggen
- `POST /api/auth/register` - Registreren
- `POST /api/auth/logout` - Uitloggen
- `GET /api/auth/me` - Huidige gebruiker

## 🛡️ Error Handling & Fallbacks

De app is gebouwd met robuuste error handling:

- **Configuratie Fallbacks**: Werkt zonder Supabase configuratie
- **API Fallbacks**: Alle APIs hebben hardcoded fallback data
- **Error Boundaries**: React error boundaries voor UI crashes
- **Graceful Degradation**: Features blijven werken bij database issues

## 🎨 Design System

- **Colors**: Tailwind CSS met custom kleuren
- **Typography**: Inter font family
- **Components**: Herbruikbare componenten met consistent design
- **Responsive**: Mobile-first design
- **Accessibility**: ARIA labels en keyboard navigation

## 📊 Database Schema

### Core Tables
- `words` - Straattaalwoorden
- `quiz_questions` - Quiz vragen
- `knowledge_items` - Kennisbank content
- `profiles` - Gebruikersprofielen
- `user_points` - Punten systeem
- `challenges` - Challenges
- `notifications` - Notificaties

## 🔐 Security

- **RLS**: Row Level Security op alle tabellen
- **Input Validation**: Server-side validatie
- **CORS**: Geconfigureerd voor productie
- **Environment Variables**: Geen secrets in code

## 🚀 Performance

- **Caching**: API response caching
- **Image Optimization**: Next.js Image component
- **Code Splitting**: Automatische code splitting
- **Bundle Analysis**: `npm run analyze`

## 🤝 Contributing

1. Fork de repository
2. Maak een feature branch (`git checkout -b feature/amazing-feature`)
3. Commit je changes (`git commit -m 'Add amazing feature'`)
4. Push naar de branch (`git push origin feature/amazing-feature`)
5. Open een Pull Request

## 📝 License

Dit project is gelicenseerd onder de MIT License - zie het [LICENSE](LICENSE) bestand voor details.

## 🆘 Support

Voor vragen of problemen:

1. Check de [Issues](https://github.com/mvgrieken/stratalia-web/issues)
2. Maak een nieuwe issue aan
3. Neem contact op via [stratalia.nl](https://stratalia.nl)

## 🎯 Roadmap

- [ ] Real-time chat features
- [ ] Voice recognition voor uitspraak
- [ ] Advanced analytics dashboard
- [ ] Multi-language support
- [ ] Offline mode voor web app
- [ ] Progressive Web App (PWA)

---

**Stratalia** - Leer straattaal op een leuke en interactieve manier! 🎉