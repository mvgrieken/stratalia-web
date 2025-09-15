# Stratalia Web App

Een moderne straattaal vertaalapp voor ouders van tieners, gebouwd met Next.js 15, React 18, en Tailwind CSS.

## 🚀 Features

- **Vertalen**: Zoek en vertaal straattaalwoorden naar het Nederlands
- **Woord van de Dag**: Dagelijks een nieuw straattaalwoord leren
- **Quiz**: Test je kennis met interactieve quizzen
- **Kennisbank**: Verdiep je kennis met artikelen en bronnen
- **Community**: Draag bij aan de straattaal database
- **Responsive Design**: Werkt perfect op desktop, tablet en mobiel

## 🛠️ Tech Stack

- **Frontend**: Next.js 15, React 18, TypeScript
- **Styling**: Tailwind CSS
- **Database**: Supabase (PostgreSQL)
- **Deployment**: Vercel
- **Testing**: Vitest, Playwright

## 📦 Installation

1. **Clone de repository**
   ```bash
   git clone <repository-url>
   cd stratalia-web
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Setup environment variables**
   ```bash
   cp .env.example .env.local
   ```
   
   Vul de volgende variabelen in:
   - `NEXT_PUBLIC_SUPABASE_URL`: Je Supabase project URL
   - `NEXT_PUBLIC_SUPABASE_ANON_KEY`: Je Supabase anon key

4. **Start development server**
   ```bash
   npm run dev
   ```

   Open [http://localhost:3000](http://localhost:3000) in je browser.

## 🏗️ Build & Deploy

### Local Build
```bash
npm run build
npm start
```

### CI/CD Pipeline

De app gebruikt GitHub Actions voor automatische CI/CD:

#### 🔄 Continuous Integration (CI)
- **Trigger**: Bij elke push en pull request
- **Stappen**:
  - ✅ Code checkout
  - ✅ Node.js 18.x setup
  - ✅ Dependencies installeren (`npm ci`)
  - ✅ Linting (`npm run lint`)
  - ✅ Build (`npm run build`)
  - ✅ Tests (`npm test`)
  - ✅ Coverage rapport

#### 🚀 Continuous Deployment (CD)
- **Trigger**: Alleen na succesvolle CI op `main` branch
- **Stappen**:
  - ✅ Build applicatie
  - ✅ Deploy naar Vercel Production
  - ✅ Health check na deployment
  - ✅ Deployment status notificatie

#### 📋 GitHub Secrets Setup

Voor automatische deployment naar Vercel, voeg deze secrets toe in GitHub:

1. **Ga naar je GitHub repository**
2. **Settings** → **Secrets and variables** → **Actions**
3. **Voeg de volgende secrets toe**:

| Secret Name | Description | How to get |
|-------------|-------------|------------|
| `VERCEL_TOKEN` | Persoonlijke Vercel token | [Vercel Dashboard](https://vercel.com/account/tokens) → Create Token |
| `VERCEL_ORG_ID` | Team/Organization ID | [Vercel Dashboard](https://vercel.com/account) → Settings → General |
| `VERCEL_PROJECT_ID` | Project ID | [Vercel Dashboard](https://vercel.com/dashboard) → Project Settings → General |
| `NEXT_PUBLIC_SUPABASE_URL` | Supabase project URL | [Supabase Dashboard](https://supabase.com/dashboard) → Settings → API |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | Supabase anon key | [Supabase Dashboard](https://supabase.com/dashboard) → Settings → API |

#### 🔧 Vercel Token Setup
1. Ga naar [Vercel Account Tokens](https://vercel.com/account/tokens)
2. Klik **Create Token**
3. Geef een naam (bijv. "GitHub Actions")
4. Kopieer de token en voeg toe als `VERCEL_TOKEN` secret

#### 🏢 Vercel Org/Project ID Setup
1. Ga naar [Vercel Dashboard](https://vercel.com/dashboard)
2. Selecteer je project
3. Ga naar **Settings** → **General**
4. Kopieer **Project ID** en **Team ID** (als je in een team zit)

#### 🎯 Deployment Flow
```
Push to main → CI Pipeline → Tests Pass → CD Pipeline → Vercel Production
     ↓
Pull Request → CI Pipeline → Tests Pass → Preview Deployment
```

#### 📊 Workflow Status
- **CI Status**: ![CI](https://github.com/username/stratalia/workflows/CI%20-%20Continuous%20Integration/badge.svg)
- **Deploy Status**: ![Deploy](https://github.com/username/stratalia/workflows/CD%20-%20Continuous%20Deployment/badge.svg)

## 📁 Project Structure

```
├── src/
│   ├── app/                 # Next.js App Router
│   │   ├── api/            # API routes
│   │   ├── search/         # Search page
│   │   ├── globals.css     # Global styles
│   │   ├── layout.tsx      # Root layout
│   │   └── page.tsx        # Homepage
│   └── __tests__/          # Test setup
├── tests/                   # E2E tests
├── public/                  # Static assets
├── next.config.js          # Next.js config
├── tailwind.config.js      # Tailwind config
└── package.json            # Dependencies
```

## 🧪 Testing

```bash
# Unit tests
npm run test

# E2E tests
npm run test:e2e

# Type checking
npm run typecheck

# Linting
npm run lint
```

## 🔧 Scripts

- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm run start` - Start production server
- `npm run lint` - Run ESLint
- `npm run typecheck` - Run TypeScript check
- `npm run test` - Run unit tests
- `npm run test:e2e` - Run E2E tests
- `npm run clean` - Clean build artifacts

## 🌐 Environment Variables

| Variable | Description | Required |
|----------|-------------|----------|
| `NEXT_PUBLIC_SUPABASE_URL` | Supabase project URL | Yes |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | Supabase anonymous key | Yes |
| `SUPABASE_SERVICE_ROLE_KEY` | Supabase service role key | No |
| `NEXT_PUBLIC_APP_URL` | App URL for production | No |

## 📱 Mobile App

Deze web app is onderdeel van de Stratalia ecosystem. Er is ook een native mobile app beschikbaar voor iOS en Android.

## 🤝 Contributing

1. Fork de repository
2. Maak een feature branch (`git checkout -b feature/amazing-feature`)
3. Commit je changes (`git commit -m 'Add amazing feature'`)
4. Push naar de branch (`git push origin feature/amazing-feature`)
5. Open een Pull Request

## 📄 License

Dit project is gelicenseerd onder de MIT License - zie het [LICENSE](LICENSE) bestand voor details.

## 🆘 Support

Voor vragen of support, open een issue in de GitHub repository of neem contact op via [email](mailto:support@stratalia.com).

---

**Stratalia** - Leer straattaal op een leuke en interactieve manier! 🎉