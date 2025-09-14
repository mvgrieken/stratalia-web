# 📊 Stratalia Monitoring & Logging Guide

## Vercel Built-in Monitoring

### 1. Function Logs
**Locatie:** Vercel Dashboard → Project → Functions → [API Endpoint] → Logs

**Wat te monitoren:**
- API response times
- Error rates
- Function invocations
- Memory usage

**Real-time monitoring:**
```bash
# Via Vercel CLI (als beschikbaar)
vercel logs --follow
```

### 2. Analytics Dashboard
**Locatie:** Vercel Dashboard → Project → Analytics

**Metrics:**
- Page views
- Unique visitors
- Core Web Vitals
- Performance scores

### 3. Deployment Logs
**Locatie:** Vercel Dashboard → Project → Deployments → [Deployment] → Build Logs

**Wat te checken:**
- Build success/failure
- Environment variable loading
- Dependency installation
- Build time

## Application Logging

### 1. API Endpoint Logging
Alle API endpoints hebben al logging geïmplementeerd:

```typescript
// Voorbeeld uit search API
console.log(`✅ Found ${results.length} results for "${query}"`);
console.error('💥 Error in search API:', error);
```

### 2. Database Logging
Import_log tabel voor database operaties:

```sql
-- Check recent database operations
SELECT type, status, created_at, source 
FROM import_log 
ORDER BY created_at DESC 
LIMIT 10;
```

### 3. Error Tracking
**Huidige implementatie:**
- Console.error voor alle API errors
- Try-catch blocks in alle endpoints
- Proper HTTP status codes
- Error details in response

## Optional Monitoring Integrations

### 1. Sentry (Error Tracking)
**Setup:**
```bash
npm install @sentry/nextjs
```

**Configuratie:**
```javascript
// sentry.client.config.js
import * as Sentry from "@sentry/nextjs";

Sentry.init({
  dsn: process.env.NEXT_PUBLIC_SENTRY_DSN,
  tracesSampleRate: 1.0,
});
```

**Voordelen:**
- Real-time error notifications
- Error grouping en deduplication
- Performance monitoring
- User context tracking

### 2. Vercel Analytics
**Setup:**
```bash
npm install @vercel/analytics
```

**Implementatie:**
```javascript
// app/layout.tsx
import { Analytics } from '@vercel/analytics/react';

export default function RootLayout({ children }) {
  return (
    <html>
      <body>
        {children}
        <Analytics />
      </body>
    </html>
  );
}
```

**Voordelen:**
- Privacy-focused analytics
- Core Web Vitals tracking
- Real-time visitor data
- Performance insights

### 3. Supabase Monitoring
**Locatie:** Supabase Dashboard → Project → Logs

**Wat te monitoren:**
- Database query performance
- API request logs
- Authentication events
- Real-time subscriptions

## Alerting Setup

### 1. Vercel Alerts
**Setup:**
- Vercel Dashboard → Project → Settings → Notifications
- Configure email/Slack notifications voor:
  - Failed deployments
  - Function errors
  - Performance degradation

### 2. Custom Health Checks
**Implementatie:**
```typescript
// app/api/health/route.ts
export async function GET() {
  try {
    // Test database connection
    const { data, error } = await supabase
      .from('words')
      .select('count')
      .limit(1);
    
    if (error) throw error;
    
    return NextResponse.json({ 
      status: 'healthy',
      database: 'connected',
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    return NextResponse.json({ 
      status: 'unhealthy',
      error: error.message 
    }, { status: 500 });
  }
}
```

## Performance Monitoring

### 1. Core Web Vitals
**Metrics te monitoren:**
- **LCP (Largest Contentful Paint):** < 2.5s
- **FID (First Input Delay):** < 100ms
- **CLS (Cumulative Layout Shift):** < 0.1

**Tools:**
- Vercel Analytics
- Google PageSpeed Insights
- Chrome DevTools

### 2. API Performance
**Targets:**
- Search API: < 1s
- Daily Word API: < 1s
- Admin Content API: < 1s
- AI Translate API: < 2s

**Monitoring:**
- Vercel Function logs
- Custom timing logs
- Database query performance

## Security Monitoring

### 1. Access Logs
**Wat te monitoren:**
- Failed authentication attempts
- Unusual API usage patterns
- Admin panel access
- Database query patterns

### 2. Environment Security
**Checks:**
- No service keys in client code
- Proper CORS configuration
- Input validation
- Rate limiting (optioneel)

## Daily Monitoring Checklist

### Morning Check (5 minuten):
- [ ] Check Vercel deployment status
- [ ] Review overnight error logs
- [ ] Check database connection health
- [ ] Verify API response times

### Weekly Review (30 minuten):
- [ ] Analyze performance trends
- [ ] Review error patterns
- [ ] Check user engagement metrics
- [ ] Update monitoring dashboards

### Monthly Deep Dive (2 uur):
- [ ] Performance optimization review
- [ ] Security audit
- [ ] Capacity planning
- [ ] Monitoring tool evaluation

## Troubleshooting Common Issues

### 1. High Error Rates
**Check:**
- Environment variables
- Database connection
- API endpoint logs
- Network connectivity

### 2. Slow Performance
**Check:**
- Database query performance
- Function memory usage
- CDN cache hit rates
- Third-party service latency

### 3. Deployment Failures
**Check:**
- Build logs
- Environment variable configuration
- Dependency versions
- Node.js version compatibility

## Monitoring Tools Summary

| Tool | Purpose | Cost | Setup Time |
|------|---------|------|------------|
| Vercel Analytics | Built-in performance | Free | 0 min |
| Vercel Logs | Function monitoring | Free | 0 min |
| Supabase Logs | Database monitoring | Free | 0 min |
| Sentry | Error tracking | Free tier | 15 min |
| Google Analytics | User analytics | Free | 10 min |

**Recommendation:** Start met Vercel built-in tools, voeg Sentry toe voor error tracking als je meer detail nodig hebt.
