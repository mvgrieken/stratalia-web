# Stratalia Production Deployment Checklist

## Pre-Deployment Checklist

### ✅ Environment Variables
- [ ] **NEXT_PUBLIC_SUPABASE_URL** - Set to production Supabase URL
- [ ] **NEXT_PUBLIC_SUPABASE_ANON_KEY** - Set to production anon key
- [ ] **NODE_ENV** - Set to "production"
- [ ] **VERCEL_ENV** - Automatically set by Vercel

### ✅ Code Quality
- [ ] **Build Success**: `npm run build` completes without errors
- [ ] **Linting**: `npm run lint` passes with no errors
- [ ] **Type Checking**: TypeScript compilation successful
- [ ] **Tests**: All tests pass (`npm test`)

### ✅ Security Review
- [ ] **RLS Policies**: Applied in Supabase production database
- [ ] **Service Keys**: Never exposed in client-side code
- [ ] **Environment Variables**: Properly configured in Vercel
- [ ] **API Security**: All endpoints have proper error handling

### ✅ Performance Optimization
- [ ] **Build Size**: Optimized bundle size
- [ ] **API Responses**: Caching headers set appropriately
- [ ] **Static Assets**: Properly configured in `/public/`
- [ ] **Database Queries**: Optimized and indexed

### ✅ Monitoring Setup
- [ ] **Health Endpoint**: `/api/health` returns 200 status
- [ ] **Logging**: Production-safe logger configured
- [ ] **Error Tracking**: Proper error handling in place
- [ ] **Performance Monitoring**: Response time tracking enabled

## Vercel Deployment Steps

### 1. Connect Repository
```bash
# Install Vercel CLI
npm i -g vercel

# Login to Vercel
vercel login

# Link project
vercel link
```

### 2. Configure Environment Variables
```bash
# Set environment variables in Vercel dashboard
vercel env add NEXT_PUBLIC_SUPABASE_URL
vercel env add NEXT_PUBLIC_SUPABASE_ANON_KEY
```

### 3. Deploy to Preview
```bash
# Deploy to preview environment
vercel --prod=false
```

### 4. Test Preview Deployment
- [ ] **Health Check**: `https://your-preview-url.vercel.app/api/health`
- [ ] **Search API**: `https://your-preview-url.vercel.app/api/words/search?query=skeer`
- [ ] **Daily Word**: `https://your-preview-url.vercel.app/api/words/daily`
- [ ] **Frontend**: Test all pages and functionality

### 5. Deploy to Production
```bash
# Deploy to production
vercel --prod
```

## Post-Deployment Verification

### ✅ API Endpoints
- [ ] **Health Check**: `GET /api/health` returns 200
- [ ] **Search API**: `GET /api/words/search?query=skeer` returns results
- [ ] **Daily Word**: `GET /api/words/daily` returns word
- [ ] **Content API**: `GET /api/content/approved` returns approved content

### ✅ Frontend Functionality
- [ ] **Home Page**: Loads correctly
- [ ] **Search Page**: Search functionality works
- [ ] **Translate Page**: Translation features work
- [ ] **Quiz Page**: Quiz functionality works
- [ ] **Navigation**: All links work correctly

### ✅ Performance Checks
- [ ] **Page Load Times**: < 3 seconds for all pages
- [ ] **API Response Times**: < 1 second for all endpoints
- [ ] **Core Web Vitals**: Pass Google PageSpeed Insights
- [ ] **Mobile Performance**: Test on mobile devices

### ✅ Security Verification
- [ ] **HTTPS**: All traffic uses HTTPS
- [ ] **CORS**: Proper CORS headers set
- [ ] **RLS Policies**: Database access properly restricted
- [ ] **Error Handling**: No sensitive information in error messages

### ✅ Monitoring Setup
- [ ] **Vercel Analytics**: Enabled and working
- [ ] **Function Logs**: Accessible in Vercel dashboard
- [ ] **Error Tracking**: Errors properly logged
- [ ] **Performance Metrics**: Response times tracked

## Supabase Configuration

### 1. Production Database Setup
```sql
-- Apply RLS policies
\i supabase-policies.sql

-- Verify policies are applied
SELECT schemaname, tablename, policyname, roles, cmd 
FROM pg_policies 
WHERE schemaname = 'public';
```

### 2. Database Security
- [ ] **RLS Enabled**: Row Level Security enabled on all tables
- [ ] **Anon Access**: Only SELECT permissions for anonymous users
- [ ] **Service Role**: Full access for backend operations
- [ ] **Backup**: Regular backups configured

### 3. Performance Optimization
- [ ] **Indexes**: Proper indexes on frequently queried columns
- [ ] **Connection Pool**: Optimized connection pool settings
- [ ] **Query Performance**: Monitor slow queries

## Monitoring and Alerting

### 1. Vercel Monitoring
- [ ] **Function Metrics**: Monitor invocation count and duration
- [ ] **Error Rates**: Set up alerts for high error rates
- [ ] **Response Times**: Monitor API response times
- [ ] **Build Status**: Monitor deployment success

### 2. Supabase Monitoring
- [ ] **Database Performance**: Monitor query performance
- [ ] **Connection Pool**: Monitor active connections
- [ ] **Storage Usage**: Monitor database size
- [ ] **API Usage**: Monitor API request volume

### 3. Custom Monitoring
- [ ] **Health Checks**: Regular health check monitoring
- [ ] **Uptime Monitoring**: External uptime monitoring service
- [ ] **Performance Monitoring**: Core Web Vitals tracking
- [ ] **Error Tracking**: Centralized error logging

## Rollback Plan

### 1. Quick Rollback
```bash
# Rollback to previous deployment
vercel rollback

# Or deploy specific commit
vercel --prod --force
```

### 2. Database Rollback
```sql
-- If needed, rollback database changes
-- (Use with caution - test first)
```

### 3. Environment Rollback
- [ ] **Environment Variables**: Revert to previous values
- [ ] **Configuration**: Revert configuration changes
- [ ] **Dependencies**: Revert dependency updates

## Maintenance Tasks

### Daily
- [ ] **Health Check**: Verify all systems operational
- [ ] **Error Logs**: Review error logs for issues
- [ ] **Performance**: Check response times

### Weekly
- [ ] **Security Review**: Review access logs
- [ ] **Performance Analysis**: Analyze performance metrics
- [ ] **Backup Verification**: Verify backups are working

### Monthly
- [ ] **Dependency Updates**: Update dependencies
- [ ] **Security Patches**: Apply security patches
- [ ] **Performance Optimization**: Review and optimize

## Emergency Procedures

### 1. Service Outage
1. Check Vercel dashboard for function errors
2. Check Supabase dashboard for database issues
3. Review error logs for root cause
4. Implement fix or rollback if necessary

### 2. Performance Issues
1. Check function duration in Vercel
2. Review database query performance
3. Check for high traffic or DDoS
4. Scale resources if necessary

### 3. Security Incident
1. Review access logs
2. Check for unauthorized access
3. Revoke compromised credentials
4. Update security policies

## Contact Information

### Support Channels
- **Vercel Support**: https://vercel.com/support
- **Supabase Support**: https://supabase.com/support
- **Application Issues**: Check logs and health endpoint first

### Escalation
1. **Level 1**: Check logs and health endpoint
2. **Level 2**: Review Vercel and Supabase dashboards
3. **Level 3**: Contact platform support
4. **Level 4**: Emergency rollback procedures

## Success Criteria

### ✅ Deployment Success
- [ ] All tests pass
- [ ] Health endpoint returns 200
- [ ] All API endpoints functional
- [ ] Frontend loads correctly
- [ ] Performance metrics within acceptable ranges

### ✅ Production Readiness
- [ ] Security policies applied
- [ ] Monitoring configured
- [ ] Error handling in place
- [ ] Performance optimized
- [ ] Documentation complete

---

**Last Updated**: 2025-01-15
**Version**: 1.0.0
**Next Review**: 2025-02-15
