# 🚀 Vercel Deployment Checklist - Stratalia

## 📋 Pre-Deployment Analysis

### ✅ Project Configuration
- **Framework**: Next.js 15.0.0
- **Build Command**: `next build` (default)
- **Output Directory**: `.next` (default)
- **Install Command**: `npm install` (default)
- **Node Version**: >=18.0.0 (specified in package.json)

### ✅ Vercel.json Configuration
- **CORS Headers**: Configured for API routes
- **Function Timeout**: 30 seconds for API routes
- **No Custom Build Overrides**: Uses Next.js defaults

## 🔧 Vercel Project Settings

### Build & Output Settings
```
Framework Preset: Next.js
Build Command: next build
Output Directory: .next
Install Command: (leave empty - uses default npm install)
Development Command: next dev
```

**✅ Action**: Use Next.js preset - no overrides needed

### Environment Variables
**Required Variables** (set in Vercel → Project Settings → Environment Variables):

#### 🔑 Supabase Configuration
```
NEXT_PUBLIC_SUPABASE_URL=https://trrsgvxoylhcudtiimvb.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InRycnNndnhveWxoY3VkdGlpbXZiIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTYxOTQ3OTIsImV4cCI6MjA3MTc3MDc5Mn0.PG4cDu5UVUwE4Kp7NejdTcxdJDypkpdpQSO97Ipl8kQ
```

#### 🌍 App Configuration (Optional)
```
NEXT_PUBLIC_APP_URL=https://your-app.vercel.app
```

**✅ Action**: Set all variables for Production, Preview, and Development environments

## 📝 Deployment Checklist

### Pre-Deployment
- [ ] **Local Build Test**: `npm run build` succeeds
- [ ] **Lint Check**: `npm run lint` passes (warnings OK)
- [ ] **Type Check**: `npm run typecheck` passes
- [ ] **Git Commit**: All changes committed and pushed to main branch
- [ ] **Environment Variables**: Verified in Vercel dashboard

### Vercel Configuration
- [ ] **Framework Preset**: Set to "Next.js"
- [ ] **Build Command**: Leave empty (uses default `next build`)
- [ ] **Output Directory**: Leave empty (uses default `.next`)
- [ ] **Install Command**: Leave empty (uses default `npm install`)
- [ ] **Node.js Version**: 18.x or higher

### Environment Variables Setup
- [ ] **NEXT_PUBLIC_SUPABASE_URL**: Set to production Supabase URL
- [ ] **NEXT_PUBLIC_SUPABASE_ANON_KEY**: Set to production Supabase anon key
- [ ] **NEXT_PUBLIC_APP_URL**: Set to your Vercel app URL (optional)
- [ ] **Environment Scope**: All variables set for Production, Preview, Development

### Deployment Process
- [ ] **Push to GitHub**: Code pushed to main branch
- [ ] **Vercel Build**: Automatic build starts and completes successfully
- [ ] **Build Logs**: No critical errors in Vercel build logs
- [ ] **Deployment URL**: App accessible at Vercel URL

### Post-Deployment Testing
- [ ] **Homepage**: `https://your-app.vercel.app/` loads correctly
- [ ] **Search API**: `https://your-app.vercel.app/api/words/search?query=skeer&limit=5` returns data
- [ ] **Daily Word API**: `https://your-app.vercel.app/api/words/daily` returns word
- [ ] **Admin Content API**: `https://your-app.vercel.app/api/admin/content` returns 6+ items
- [ ] **Leaderboard API**: `https://your-app.vercel.app/api/gamification/leaderboard` works
- [ ] **Frontend Pages**: All pages load without errors
- [ ] **Database Connection**: All APIs show real Supabase data (not mock data)

### Performance & Security
- [ ] **API Response Times**: All endpoints respond < 2 seconds
- [ ] **CORS Headers**: API endpoints accessible from frontend
- [ ] **Environment Variables**: No sensitive keys exposed in client-side code
- [ ] **Error Handling**: Proper error responses for failed requests

## 🚨 Troubleshooting

### Common Issues
1. **Build Fails**: Check Node.js version (must be 18+)
2. **API Errors**: Verify environment variables are set correctly
3. **Database Connection**: Ensure Supabase URL and key are correct
4. **CORS Issues**: Check vercel.json headers configuration

### Verification Commands
```bash
# Test API endpoints after deployment
curl "https://your-app.vercel.app/api/words/search?query=skeer&limit=5"
curl "https://your-app.vercel.app/api/words/daily"
curl "https://your-app.vercel.app/api/admin/content"
```

## 📊 Success Criteria

**✅ Deployment is successful when:**
- All API endpoints return real Supabase data
- Frontend loads without console errors
- Search functionality works with actual words
- Admin panel shows pending content items
- Performance is acceptable (< 2s response times)
- No critical errors in Vercel logs

## 🔗 Useful Links
- [Vercel Dashboard](https://vercel.com/dashboard)
- [Supabase Dashboard](https://supabase.com/dashboard)
- [Next.js Deployment Docs](https://nextjs.org/docs/deployment)

---

**Last Updated**: 2025-01-14  
**Project**: Stratalia Web App  
**Framework**: Next.js 15.0.0  
**Database**: Supabase
