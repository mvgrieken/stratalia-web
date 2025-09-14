# 🚀 Stratalia Vercel Deployment Guide

## Environment Variables Setup

### In Vercel Dashboard:
1. Ga naar [vercel.com](https://vercel.com) en log in
2. Selecteer je project of maak een nieuwe aan
3. Ga naar **Settings** → **Environment Variables**
4. Voeg de volgende variabelen toe:

| Variable Name | Value | Environment |
|---------------|-------|-------------|
| `NEXT_PUBLIC_SUPABASE_URL` | `https://trrsgvxoylhcudtiimvb.supabase.co` | Production, Preview, Development |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | `eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InRycnNndnhveWxoY3VkdGlpbXZiIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTYxOTQ3OTIsImV4cCI6MjA3MTc3MDc5Mn0.PG4cDu5UVUwE4Kp7NejdTcxdJDypkpdpQSO97Ipl8kQ` | Production, Preview, Development |

**⚠️ BELANGRIJK:** 
- `SUPABASE_SERVICE_KEY` wordt NIET gebruikt in deze app (veilig!)
- Alle environment variables zijn publiek toegankelijk (NEXT_PUBLIC_*)
- Geen gevoelige data in client-side code

## Deployment Routes

### Route 1: Vercel Dashboard (Aanbevolen)

1. **GitHub Repository Setup:**
   - Push je code naar GitHub
   - Zorg dat alle bestanden gecommit zijn

2. **Vercel Project Aanmaken:**
   - Ga naar [vercel.com/dashboard](https://vercel.com/dashboard)
   - Klik **"New Project"**
   - Selecteer je GitHub repository
   - Kies **"Import"**

3. **Project Configuratie:**
   - **Framework Preset:** Next.js (automatisch gedetecteerd)
   - **Root Directory:** `./` (default)
   - **Build Command:** `npm run build` (default)
   - **Output Directory:** `.next` (default)
   - **Install Command:** `npm install` (default)

4. **Environment Variables:**
   - Voeg de variabelen toe zoals hierboven beschreven
   - Zet ze op **Production, Preview, Development**

5. **Deploy:**
   - Klik **"Deploy"**
   - Wacht tot build compleet is (2-3 minuten)

### Route 2: Vercel CLI (Alternatief)

```bash
# Install Vercel CLI (als je die nog niet hebt)
npm i -g vercel

# Login to Vercel
vercel login

# Navigate to project directory
cd /Users/martijnvangrieken/Dropbox/Apps/stratalia

# Deploy to production
vercel --prod

# Follow prompts:
# - Link to existing project? (N voor nieuwe)
# - Project name: stratalia-web
# - Directory: ./
# - Override settings? (N)
```

**Fallback als CLI blijft hangen:**
- Gebruik Route 1 (Dashboard) als CLI niet werkt
- Check je internetverbinding
- Probeer `vercel logout` en `vercel login` opnieuw

## Post-Deployment Tests

Na deployment, test deze endpoints:

### API Endpoints Test:
```bash
# Test search API
curl "https://your-app.vercel.app/api/words/search?query=skeer&limit=5"

# Test daily word API
curl "https://your-app.vercel.app/api/words/daily"

# Test admin content API (moet 8 pending items tonen)
curl "https://your-app.vercel.app/api/admin/content"
```

### Frontend Tests:
1. **Homepage:** Laad de app en controleer dat de interface zichtbaar is
2. **Search:** Zoek naar "skeer" en controleer resultaten
3. **Word of the Day:** Controleer dat dagelijks woord wordt getoond
4. **Admin Panel:** Controleer dat CMS-knop zichtbaar is (voor admin users)

## Monitoring & Logging

### Vercel Logs:
1. Ga naar je project in Vercel Dashboard
2. Klik op **"Functions"** tab
3. Selecteer een API endpoint
4. Bekijk **"Logs"** voor real-time monitoring

### Error Monitoring (Optioneel):
- **Sentry:** Voor error tracking
- **Vercel Analytics:** Voor performance monitoring
- **Supabase Dashboard:** Voor database monitoring

## Troubleshooting

### Common Issues:
1. **Build Fails:** Check Node.js versie (moet 18+ zijn)
2. **API Errors:** Check environment variables
3. **CORS Issues:** Check vercel.json headers
4. **Database Connection:** Check Supabase URL en key

### Support:
- Vercel Docs: [vercel.com/docs](https://vercel.com/docs)
- Supabase Docs: [supabase.com/docs](https://supabase.com/docs)
- Next.js Docs: [nextjs.org/docs](https://nextjs.org/docs)
