# Stratalia - Nederlandse Straattaal Leerplatform

Een modern, interactief platform voor het leren van Nederlandse straattaal met AI-vertaling, quizzen, en community features. Volledig functioneel met of zonder Supabase configuratie.

## 🚀 Features

### Core Functionaliteiten
- **🔍 Zoeken**: Uitgebreide zoekfunctie met debounce, loading indicators en fallback data
- **🤖 AI Vertalen**: Bidirectionele vertaling tussen straattaal en standaard Nederlands
- **📅 Woord van de Dag**: Dagelijks nieuwe straattaalwoorden met audio functionaliteit
- **🧠 Quiz**: Interactieve quizzen met verschillende moeilijkheidsgraden
- **📚 Kennisbank**: Artikelen, video's, podcasts en infographics met filters
- **🏆 Leaderboard**: Gamification met punten, levels en streaks
- **👥 Community**: Gebruikers kunnen woorden toevoegen met validatie en spam bescherming
- **📊 Dashboard**: Persoonlijke voortgang en statistieken
- **🎯 Challenges**: Dagelijkse uitdagingen en achievements

### Technische Features
- **⚡ Performance**: Lazy loading, caching, en geoptimaliseerde bundle sizes
- **🛡️ Error Handling**: Robuuste error handling met fallback data
- **📱 Responsive**: Volledig responsive design voor alle apparaten
- **♿ Accessibility**: ARIA labels, keyboard navigation, en screen reader support
- **🔒 Security**: Rate limiting, input validatie, en spam bescherming
- **🌐 Offline Ready**: Werkt zonder internetverbinding met fallback data

## 🛠️ Tech Stack

- **Frontend**: Next.js 15, React 18, TypeScript (strict mode)
- **Backend**: Next.js API Routes, Supabase
- **Database**: PostgreSQL (via Supabase)
- **Authentication**: Supabase Auth
- **Styling**: Tailwind CSS
- **Deployment**: Vercel
- **Testing**: Vitest, Playwright
- **Monitoring**: Custom logging en performance tracking

## 📋 Vereisten

- Node.js 18+ 
- npm of yarn
- Supabase account (optioneel - app werkt met fallback data)

## 🚀 Installatie

### 1. Clone de repository
```bash
git clone https://github.com/mvgrieken/stratalia-web.git
cd stratalia-web
```

### 2. Installeer dependencies
```bash
npm install
```

### 3. Configureer environment variabelen
```bash
cp env.example .env.local
```

Vul de volgende variabelen in:

#### Verplichte variabelen
```env
# Supabase Configuration (optioneel - app werkt zonder)
NEXT_PUBLIC_SUPABASE_URL=your_supabase_project_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
SUPABASE_SERVICE_ROLE_KEY=your_supabase_service_role_key

# Application Configuration
NEXT_PUBLIC_APP_URL=https://stratalia.nl
NEXT_PUBLIC_APP_NAME=Stratalia
NODE_ENV=development
```

**⚠️ Belangrijk voor Vercel Deployment:**
Zorg dat je de juiste environment variabelen hebt ingesteld in Vercel:
- `NEXT_PUBLIC_SUPABASE_URL` - Je Supabase project URL
- `NEXT_PUBLIC_SUPABASE_ANON_KEY` - Je Supabase anon key
- `SUPABASE_SERVICE_ROLE_KEY` - Je Supabase service role key (niet de anon key!)

De service key is nodig voor server-side authenticatie operaties en mag nooit in de frontend bundel terechtkomen.

#### CI (GitHub Actions) secrets
Zet dezelfde variabelen ook als GitHub Actions secrets voor de build stap:
- `NEXT_PUBLIC_SUPABASE_URL`
- `NEXT_PUBLIC_SUPABASE_ANON_KEY`
- `SUPABASE_SERVICE_ROLE_KEY`

Let op: de service role key wordt uitsluitend gebruikt in server-side API routes.

### ✅ Production Auth Checklist

Zorg in productie voor een werkende login/sessie:

- Supabase Auth → Settings
  - Site URL: `https://stratalia.nl`
  - Additional Redirect URLs: `https://stratalia.nl/auth/callback`
  - Email confirmation: testaccounts bevestigen of tijdelijk uitschakelen voor testen
- Vercel Environment Variables (Production)
  - `NEXT_PUBLIC_SUPABASE_URL` en `NEXT_PUBLIC_SUPABASE_ANON_KEY` verwijzen naar hetzelfde Supabase‑project als hierboven
- Loginflow (server‑side)
  - Primair: Client POST naar `/api/auth/login-post` met `{ email, password, redirect_to: '/dashboard' }`
  - Server zet cookies via `@supabase/ssr` en retourneert `303 See Other` met `Location: /dashboard`
  - Client haalt daarna `GET /api/auth/me` op om de user‑context te initialiseren
  - Fallbacks (alleen indien nodig bij custom‑domain POST‑blokkade door CDN/WAF):
    - Proxy: `POST /api/auth/proxy-login` → stuurt door naar `https://<project>.vercel.app/api/auth/login-post` en forwardt `Set-Cookie`/`Location`
    - GET‑attach: Client logt in met `supabase.auth.signInWithPassword`, daarna `GET /api/auth/attach-session` met headers `Authorization: Bearer <access>` en `x-refresh-token: <refresh>` om HttpOnly cookies te zetten

#### Custom domain blokkeert POST naar /api/*
Als `POST https://<custom-domain>/api/test-post` resulteert in `403 Only GET requests are allowed`, zit er een CDN/WAF of proxy‑regel vóór Vercel.

Los dit structureel op door POST en OPTIONS toe te staan op `/api/*` (of specifiek `/api/auth/*`).

Debug/checklist:
- Test: `curl -i -X POST https://<custom-domain>/api/test-post -d '{}' -H 'Content-Type: application/json'`
- Vercel subdomain: test hetzelfde path op `https://<project>.vercel.app` om uit te sluiten dat het aan de app ligt
- Force redeploy: `vercel --prod --force` als er nog verouderde edge‑functies hangen
- Tijdelijke workarounds (documenteer en verwijder zodra domein fixed is):
  - Gebruik `POST /api/auth/proxy-login`
  - Of client‑fallback + `GET /api/auth/attach-session`

#### Optionele variabelen
```env
# Rate Limiting
RATE_LIMIT_REQUESTS_PER_MINUTE=60
RATE_LIMIT_BURST=10

# Cache Configuration
CACHE_TTL_SECONDS=300
CACHE_MAX_SIZE=1000

# Monitoring & Logging
LOG_LEVEL=info
ENABLE_PERFORMANCE_MONITORING=true

# External Services (optioneel)
OPENAI_API_KEY=your_openai_api_key_here
GOOGLE_TRANSLATE_API_KEY=your_google_translate_api_key_here

# Feature Flags
ENABLE_QUIZ=true
ENABLE_LEADERBOARD=true
ENABLE_COMMUNITY=true
ENABLE_CHALLENGES=true
```

### 4. Start de development server
```bash
npm run dev
```

De app is nu beschikbaar op [http://localhost:3000](http://localhost:3000)

## 🏗️ Project Structuur

```
src/
├── app/                    # Next.js App Router
│   ├── api/               # API Routes
│   │   ├── ai/           # AI vertaling endpoints
│   │   ├── auth/         # Authenticatie endpoints
│   │   ├── community/    # Community endpoints
│   │   ├── gamification/ # Leaderboard, challenges, points
│   │   ├── quiz/         # Quiz endpoints
│   │   └── words/        # Woorden endpoints
│   ├── challenges/       # Challenges pagina
│   ├── community/        # Community pagina
│   ├── dashboard/        # Dashboard pagina
│   ├── knowledge/        # Kennisbank pagina
│   ├── leaderboard/      # Leaderboard pagina
│   ├── quiz/            # Quiz pagina
│   └── search/          # Zoek pagina
├── components/           # React componenten
│   ├── ErrorBoundary/   # Error boundary componenten
│   ├── Fallbacks/       # Fallback UI componenten
│   ├── Quiz/           # Quiz componenten
│   └── ...
├── hooks/               # Custom React hooks
├── lib/                 # Utility libraries
│   ├── cache/          # Caching system
│   ├── database/       # Database utilities
│   ├── errors.ts       # Error handling
│   ├── logger.ts       # Logging system
│   ├── mock-data.ts    # Fallback data
│   └── ...
├── middleware/          # Next.js middleware
├── repositories/        # Data access layer
├── services/           # Business logic layer
└── types/              # TypeScript type definitions
```

## 🔧 Development

### Beschikbare Scripts

```bash
# Development
npm run dev              # Start development server
npm run build           # Build voor productie
npm run start           # Start productie server

# Code Quality
npm run lint            # ESLint check
npm run typecheck       # TypeScript check
npm run clean           # Clean build artifacts

# Testing
npm run test            # Run unit tests
npm run test:coverage   # Run tests met coverage
npm run test:e2e        # Run E2E tests

# Analysis
npm run analyze         # Bundle analyzer
```

### Code Style

- **TypeScript**: Strict mode enabled
- **ESLint**: Configured met Next.js rules
- **Prettier**: Code formatting
- **Conventions**: 
  - PascalCase voor componenten
  - camelCase voor functies en variabelen
  - kebab-case voor bestandsnamen
  - Prefix unused parameters met `_`

## 🧪 Testing

### Unit Tests
```bash
npm run test
```

### E2E Tests
```bash
npm run test:e2e
```

### Test Coverage
```bash
npm run test:coverage
```

## 🚀 Deployment

### Vercel (Aanbevolen)

1. **Connect repository aan Vercel**
2. **Configureer environment variabelen** in Vercel dashboard
3. **Deploy automatisch** bij push naar main branch

### Deployment Notes (Auth & API)

- Om 403‑blokkades op POST naar `/api/*` op custom domains te voorkomen, is `vercel.json` toegevoegd:
  - Alle API‑routes draaien gegarandeerd op Node runtime (geen Edge)
  - Cache voor `/api/*` is uitgeschakeld
- `next.config.js` zet expliciet `experimental.runtime = 'nodejs'` om Edge‑runtime te voorkomen.
- Testen:
```bash
curl -i -X POST https://<your-domain>/api/test-post \
  -H 'Content-Type: application/json' \
  -d '{}'
```
Verwacht: `200 OK` met `{ ok: true }`.

- Bij problemen: voer een geforceerde productie‑deploy uit:
```bash
vercel --prod --force
```

Maak testscript uitvoerbaar:
```bash
chmod +x scripts/test-api.sh
```

Force deploy script:
```bash
chmod +x scripts/deploy-force.sh
./scripts/deploy-force.sh
```

GitHub Actions – API Tests:
- Workflow: "API Tests" draait op elke push naar `main` of handmatig via de Actions‑tab.
- Doel: verifiëren dat `POST /api/test-post` 200 geeft en login‑POST niet meer 403 retourneert.

### Manual Deployment

```bash
npm run build
npm run start
```

## 📊 Performance

### Bundle Analysis
```bash
npm run analyze
```

### Performance Metrics
- **First Load JS**: ~99-112 kB per page
- **Build Time**: ~30-60 seconden
- **Lighthouse Score**: 90+ op alle metrics

### Optimizations
- **Lazy Loading**: Componenten worden lazy geladen
- **Code Splitting**: Automatische code splitting
- **Image Optimization**: Next.js Image component
- **Caching**: In-memory caching voor API responses
- **Bundle Analysis**: Geoptimaliseerde bundle sizes

## 🛡️ Security

### Rate Limiting
- **API Routes**: 100 requests per 15 minuten
- **Search**: 30 requests per minuut
- **Quiz**: 20 requests per 5 minuten
- **Auth**: 5 requests per 15 minuten
- **Community**: 10 requests per 5 minuten

### Input Validation
- **Client-side**: Real-time validatie
- **Server-side**: Comprehensive validatie
- **Sanitization**: XSS bescherming
- **CSRF**: Built-in CSRF bescherming

### Error Handling
- **Graceful Degradation**: App werkt zonder database
- **Fallback Data**: Mock data voor alle features
- **User-friendly Messages**: Geen technische errors
- **Logging**: Comprehensive error logging

## 🔍 Monitoring

### Logging
- **Structured Logging**: JSON format in productie
- **Error Tracking**: Comprehensive error logging
- **Performance Monitoring**: Response time tracking
- **User Actions**: Activity tracking

### Sentry (optioneel)
- Voeg `SENTRY_DSN` toe aan Vercel/CI om server-side error captures te activeren.
- Optioneel: `SENTRY_TRACES_SAMPLE_RATE` (bijv. 0.1) voor performance tracing.
- Implementatie: zie `src/lib/sentry.ts`.

### Gestandaardiseerde API error handling
- Gebruik `withApiError` voor uniforme error responses en Sentry capture.
- Gebruik `withZod` voor query/body validatie.
- Voorbeeld:
```ts
import { withApiError, withZod } from '@/lib/api-wrapper';
import { z } from 'zod';

const schema = z.object({ q: z.string().min(1) });
export const GET = withApiError(withZod(schema, async (req) => {
  return NextResponse.json({ ok: true });
}));
```

### Health Checks
- **API Health**: `/api/health` endpoint
- **Database Status**: Supabase connectivity check
- **Service Status**: External service monitoring

## 🤝 Contributing

### Development Workflow

1. **Fork** de repository
2. **Create** een feature branch
3. **Make** je changes
4. **Test** je changes
5. **Submit** een pull request

### Code Standards

- **TypeScript**: Strict mode
- **Testing**: Unit tests voor nieuwe features
- **Documentation**: Update README voor nieuwe features
- **Performance**: Geen performance regressies

## 📝 API Documentation

### Endpoints

#### Search
```
GET /api/words/search?query={word}&limit={number}
```

#### AI Translation
```
POST /api/ai/translate
{
  "text": "string",
  "direction": "to_slang" | "to_formal",
  "context": "string" (optional)
}
```

#### Quiz
```
GET /api/quiz?difficulty={easy|medium|hard}&limit={number}
POST /api/quiz/submit
{
  "score": number,
  "totalQuestions": number,
  "percentage": number,
  "timeTaken": number,
  "difficulty": string
}
```

#### Community
```
POST /api/community/submit
{
  "word": "string",
  "definition": "string",
  "example": "string",
  "context": "string" (optional),
  "source": "string" (optional)
}
```

#### Leaderboard
```
GET /api/gamification/leaderboard?period={daily|weekly|monthly|all_time}&limit={number}
```

## 🐛 Troubleshooting

### Veelvoorkomende Problemen

#### Build Errors
```bash
# Clean en rebuild
npm run clean
npm install
npm run build
```

#### TypeScript Errors
```bash
# Type check
npm run typecheck
```

#### Supabase Connection Issues
- App werkt zonder Supabase configuratie
- Check environment variabelen
- Verify Supabase project status

### Debug Mode
```bash
# Enable debug logging
LOG_LEVEL=debug npm run dev
```

## 📄 License

MIT License - zie [LICENSE](LICENSE) bestand voor details.

## 🙏 Acknowledgments

- **Supabase** voor de backend infrastructure
- **Vercel** voor deployment platform
- **Next.js** team voor het geweldige framework
- **Tailwind CSS** voor de styling utilities

## 📞 Support

- **Issues**: [GitHub Issues](https://github.com/mvgrieken/stratalia-web/issues)
- **Discussions**: [GitHub Discussions](https://github.com/mvgrieken/stratalia-web/discussions)
- **Email**: support@stratalia.nl

---

**Stratalia** - Leer Nederlandse straattaal op een leuke en interactieve manier! 🚀