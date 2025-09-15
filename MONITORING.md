# Stratalia Monitoring & Logging Guide

## Overview
This document explains how to monitor the Stratalia application in production, including logging, error tracking, and performance monitoring.

## Logging System

### Production-Safe Logger
The application uses a custom logger (`src/lib/logger.ts`) that:
- **Development**: Logs all levels (debug, info, warn, error)
- **Production**: Only logs warnings and errors
- **Format**: Structured JSON with timestamps and context

### Log Levels
- **ERROR**: Critical issues that need immediate attention
- **WARN**: Issues that should be investigated but don't break functionality
- **INFO**: General application flow (API requests, database operations)
- **DEBUG**: Detailed information for development (disabled in production)

### Log Categories
- **API**: Request/response logging with status codes and duration
- **Database**: Query operations with performance metrics
- **Security**: Authentication, authorization, and security events
- **Performance**: Slow operations (>1000ms) and performance metrics

## Monitoring Endpoints

### Health Check
**Endpoint**: `GET /api/health`

**Response**:
```json
{
  "status": "ok",
  "message": "All systems operational",
  "timestamp": "2025-01-15T10:30:00.000Z",
  "uptime": 3600,
  "environment": "production",
  "version": "1.0.0",
  "checks": {
    "database": "ok",
    "environment": "ok"
  },
  "responseTime": "45ms"
}
```

**Status Codes**:
- `200`: All systems healthy
- `503`: Service unavailable (database issues, missing env vars)

## Vercel Monitoring

### 1. Vercel Dashboard
- **URL**: https://vercel.com/dashboard
- **Metrics**: Function invocations, response times, error rates
- **Logs**: Real-time function logs and errors

### 2. Function Logs
```bash
# View recent logs
vercel logs --follow

# View logs for specific function
vercel logs --function=api/words/search
```

### 3. Performance Monitoring
- **Core Web Vitals**: Available in Vercel Analytics
- **Function Duration**: Monitor in Vercel Dashboard
- **Error Rates**: Track in Vercel Functions tab

## Supabase Monitoring

### 1. Supabase Dashboard
- **URL**: https://supabase.com/dashboard
- **Database**: Query performance, connection pool status
- **Auth**: User authentication metrics
- **Storage**: File upload/download metrics

### 2. Database Logs
```sql
-- Check recent errors
SELECT * FROM pg_stat_database WHERE datname = 'postgres';

-- Monitor slow queries
SELECT query, mean_time, calls 
FROM pg_stat_statements 
ORDER BY mean_time DESC 
LIMIT 10;
```

### 3. RLS Policy Monitoring
```sql
-- Check policy violations
SELECT schemaname, tablename, policyname, roles, cmd
FROM pg_policies 
WHERE schemaname = 'public';
```

## Error Tracking

### 1. Application Errors
All errors are logged with structured format:
```json
{
  "timestamp": "2025-01-15T10:30:00.000Z",
  "level": "ERROR",
  "message": "Database connection failed",
  "context": {
    "endpoint": "/api/words/search",
    "method": "GET",
    "duration": "5000ms"
  }
}
```

### 2. Common Error Scenarios
- **Database Connection**: Check Supabase status and credentials
- **RLS Policy Violations**: Verify user permissions
- **Environment Variables**: Ensure all required vars are set
- **Rate Limiting**: Monitor API usage patterns

## Performance Monitoring

### 1. API Response Times
- **Target**: < 500ms for most endpoints
- **Alert**: > 1000ms response time
- **Monitoring**: Built into logger with performance metrics

### 2. Database Performance
- **Connection Pool**: Monitor active connections
- **Query Performance**: Track slow queries (>100ms)
- **Index Usage**: Ensure proper indexing

### 3. Caching
- **API Responses**: Cache headers set for appropriate endpoints
- **Static Assets**: Vercel CDN caching
- **Database**: Query result caching where applicable

## Alerting Setup

### 1. Vercel Alerts
- **Function Errors**: > 5% error rate
- **Response Time**: > 2000ms average
- **Function Timeout**: Any timeout errors

### 2. Supabase Alerts
- **Database Connection**: Connection pool exhaustion
- **Query Performance**: Slow query detection
- **Storage Usage**: Approaching limits

### 3. Custom Monitoring
```bash
# Health check monitoring
curl -f https://your-app.vercel.app/api/health || echo "Health check failed"

# API endpoint monitoring
curl -f https://your-app.vercel.app/api/words/daily || echo "Daily word API failed"
```

## Log Analysis

### 1. Production Logs
```bash
# Filter for errors only
vercel logs | grep "ERROR"

# Filter for specific endpoint
vercel logs | grep "api/words/search"

# Filter for performance issues
vercel logs | grep "PERF"
```

### 2. Database Logs
```sql
-- Recent errors
SELECT * FROM pg_stat_database 
WHERE datname = 'postgres' 
AND numbackends > 0;

-- Query performance
SELECT query, mean_time, calls, total_time
FROM pg_stat_statements 
WHERE mean_time > 100
ORDER BY mean_time DESC;
```

## Troubleshooting Guide

### 1. High Error Rates
1. Check Vercel function logs
2. Verify environment variables
3. Test database connectivity
4. Check RLS policies

### 2. Slow Performance
1. Monitor function duration in Vercel
2. Check database query performance
3. Verify caching is working
4. Review API response sizes

### 3. Database Issues
1. Check Supabase dashboard
2. Verify connection limits
3. Review RLS policies
4. Check for long-running queries

## Best Practices

### 1. Logging
- Use structured logging with consistent format
- Include relevant context (user ID, request ID, etc.)
- Don't log sensitive information
- Use appropriate log levels

### 2. Monitoring
- Set up alerts for critical metrics
- Monitor both application and infrastructure
- Regular health check monitoring
- Performance baseline establishment

### 3. Error Handling
- Graceful degradation for non-critical features
- Clear error messages for users
- Detailed error logging for debugging
- Proper HTTP status codes

## Contact Information

For monitoring issues or questions:
- **Vercel Support**: https://vercel.com/support
- **Supabase Support**: https://supabase.com/support
- **Application Issues**: Check logs and health endpoint first