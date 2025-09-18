#!/bin/bash

# Script to set up Vercel environment variables for Stratalia

echo "Setting up Vercel environment variables..."

# Set Supabase URL
vercel env add NEXT_PUBLIC_SUPABASE_URL production <<< "https://ahcvmgwbvfgrnwuyxmzi.supabase.co"

# Set Supabase Anon Key
vercel env add NEXT_PUBLIC_SUPABASE_ANON_KEY production <<< "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InRycnNndnhveWxoY3VkdGlpbXZiIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTYxOTQ3OTIsImV4cCI6MjA3MTc3MDc5Mn0.PG4cDu5UVUwE4Kp7NejdTcxdJDypkpdpQSO97Ipl8kQ"

echo "Environment variables set successfully!"
echo "Redeploying to apply changes..."

# Redeploy to apply the new environment variables
vercel --prod

echo "Deployment complete!"
