#!/bin/bash

# Supabase Environment Setup Script for Stratalia
# This script helps you set up the required environment variables for Supabase

echo "🚀 Stratalia Supabase Environment Setup"
echo "========================================"
echo ""

# Check if we're in the right directory
if [ ! -f "package.json" ]; then
    echo "❌ Error: Please run this script from the project root directory"
    exit 1
fi

echo "📋 Required Environment Variables:"
echo "1. NEXT_PUBLIC_SUPABASE_URL"
echo "2. NEXT_PUBLIC_SUPABASE_ANON_KEY"
echo "3. SUPABASE_SERVICE_KEY"
echo "4. ADMIN_TOKEN (optional, for admin access)"
echo ""

echo "🔧 Setup Instructions:"
echo "1. Go to your Supabase project dashboard"
echo "2. Navigate to Settings > API"
echo "3. Copy the following values:"
echo ""

echo "📝 For Vercel Deployment:"
echo "1. Go to your Vercel project dashboard"
echo "2. Navigate to Settings > Environment Variables"
echo "3. Add the following variables:"
echo ""

echo "   NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co"
echo "   NEXT_PUBLIC_SUPABASE_ANON_KEY=your_anon_key_here"
echo "   SUPABASE_SERVICE_KEY=your_service_role_key_here"
echo "   ADMIN_TOKEN=your_secure_admin_token_here"
echo ""

echo "📝 For Local Development:"
echo "1. Copy env.example to .env.local:"
echo "   cp env.example .env.local"
echo ""
echo "2. Edit .env.local and add your Supabase values"
echo ""

echo "🔒 Security Notes:"
echo "- NEVER commit .env.local to git"
echo "- SUPABASE_SERVICE_KEY should only be used server-side"
echo "- ADMIN_TOKEN should be a strong, random string"
echo ""

echo "✅ After setting up environment variables:"
echo "1. Redeploy your Vercel project"
echo "2. Test registration and login functionality"
echo "3. Test admin functionality (if needed)"
echo ""

echo "🐛 Troubleshooting:"
echo "- Check Vercel logs for environment variable errors"
echo "- Ensure all required variables are set"
echo "- Verify Supabase project is active"
echo ""

echo "📚 Documentation:"
echo "- Supabase: https://supabase.com/docs"
echo "- Vercel Environment Variables: https://vercel.com/docs/concepts/projects/environment-variables"
echo ""

echo "🎉 Setup complete! Follow the instructions above to configure your environment variables."
