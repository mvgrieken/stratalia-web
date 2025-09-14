# 🔧 Supabase Setup Guide

## Environment Variables Configuration

### 1. Create `.env.local` file

Create a `.env.local` file in the root directory with the following variables:

```bash
# Supabase Configuration
NEXT_PUBLIC_SUPABASE_URL=https://trrsgvxoylhcudtiimvb.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InRycnNndnhveWxoY3VkdGlpbXZiIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTYxOTQ3OTIsImV4cCI6MjA3MTc3MDc5Mn0.PG4cDu5UVUwE4Kp7NejdTcxdJDypkpdpQSO97Ipl8kQ

# Server-side only (for admin operations)
SUPABASE_SERVICE_KEY=your_service_role_key_here

# Development settings
NODE_ENV=development
```

### 2. Environment Variables Explained

- **`NEXT_PUBLIC_SUPABASE_URL`**: Your Supabase project URL
- **`NEXT_PUBLIC_SUPABASE_ANON_KEY`**: Your Supabase anonymous key (safe for client-side)
- **`SUPABASE_SERVICE_KEY`**: Your Supabase service role key (server-side only, keep secret!)

### 3. Security Notes

- ✅ `NEXT_PUBLIC_*` variables are safe to expose in the browser
- ❌ `SUPABASE_SERVICE_KEY` should NEVER be exposed to the client
- 🔒 Add `.env.local` to your `.gitignore` file

## Testing Database Connection

### 1. Start the Development Server

```bash
npm run dev
```

### 2. Test API Endpoints

#### Search Words API
```bash
curl "http://localhost:3000/api/words/search?query=swag&limit=5"
```

Expected response:
```json
[
  {
    "id": "dde56bf0-ad96-4df9-a6d2-ec2f6672f64f",
    "word": "swag",
    "meaning": "stijl, cool, stoer",
    "example": "Die jongen heeft echt swag",
    "match_type": "exact",
    "similarity_score": 1
  }
]
```

#### Daily Word API
```bash
curl "http://localhost:3000/api/words/daily"
```

Expected response:
```json
{
  "id": "dde56bf0-ad96-4df9-a6d2-ec2f6672f64f",
  "word": "swag",
  "meaning": "stijl, cool, stoer",
  "example": "Die jongen heeft echt swag",
  "date": "2025-09-14"
}
```

### 3. Test Frontend

1. Open http://localhost:3000
2. Navigate to the Search page
3. Search for a word like "swag" or "sick"
4. Verify results are returned from the database

## Database Schema

### Tables Used

- **`words`**: Main words table with definitions and examples
- **`word_of_the_day`**: Daily word selections
- **`word_variants`**: Alternative spellings and pronunciations
- **`user_profiles`**: User information and progress
- **`quiz_sessions`**: Quiz results and scores

### RPC Functions

- **`search_words(query_text, result_limit)`**: Fuzzy and phonetic search
- **`update_word_search_fields()`**: Updates search indexes
- **`update_variant_search_fields()`**: Updates variant indexes

## Troubleshooting

### Common Issues

1. **"Database unavailable" error**
   - Check if environment variables are set correctly
   - Verify Supabase URL and keys are valid
   - Check network connectivity

2. **"Function not found" error**
   - Ensure RPC functions are deployed in Supabase
   - Check function parameters match expected format

3. **"Column does not exist" error**
   - Verify database schema matches expected structure
   - Check if migrations have been applied

### Debug Mode

Enable debug logging by checking the browser console and server logs for:
- ✅ Supabase client initialization messages
- 🔍 Search query logs
- ❌ Error messages with details

## Production Deployment

### Vercel Environment Variables

1. Go to your Vercel project settings
2. Add environment variables:
   - `NEXT_PUBLIC_SUPABASE_URL`
   - `NEXT_PUBLIC_SUPABASE_ANON_KEY`
   - `SUPABASE_SERVICE_KEY` (if needed)

### Security Checklist

- [ ] Environment variables are set in production
- [ ] Service key is not exposed to client
- [ ] RLS policies are configured in Supabase
- [ ] API rate limiting is enabled
- [ ] Error messages don't expose sensitive information

## Support

If you encounter issues:

1. Check the server logs for detailed error messages
2. Verify your Supabase project is active
3. Test the connection using the curl commands above
4. Check the Supabase dashboard for any service issues
