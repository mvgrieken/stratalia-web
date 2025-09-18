# 🔐 Supabase Auth Setup Guide

## 📋 **Stap-voor-stap Supabase Auth Configuratie**

### **1. Disable Email Confirmation (Development)**

Voor development kun je email confirmation uitschakelen:

1. **Ga naar Supabase Dashboard**: https://supabase.com/dashboard
2. **Select project**: `ahcvmgwbvfgrnwuyxmzi`
3. **Authentication** → **Settings**
4. **Email Auth** sectie:
   - **Enable email confirmations**: `OFF` (voor development)
   - **Enable email change confirmations**: `OFF` (voor development)

### **2. Test Auth Flow**

Na het uitschakelen van email confirmation:

```bash
# Test registration
curl -X POST localhost:3000/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{"email":"test@stratalia.com","password":"SecurePass123!","full_name":"Test User"}'

# Should return: 200 with user data (not 401 email confirmation)

# Test login
curl -X POST localhost:3000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"test@stratalia.com","password":"SecurePass123!"}'

# Should return: 200 with session data
```

### **3. Environment Variables Checklist**

Verify je `.env.local` heeft:

```bash
NEXT_PUBLIC_SUPABASE_URL=https://ahcvmgwbvfgrnwuyxmzi.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIs... (your correct anon key)
SUPABASE_SERVICE_ROLE_KEY=eyJhbGciOiJIUzI1NiIs... (your correct service key)
```

### **4. Supabase Dashboard Settings**

**Authentication** → **Settings**:
- ✅ **Enable email confirmations**: OFF (development)
- ✅ **Enable signup**: ON
- ✅ **Enable manual linking**: OFF
- ✅ **Site URL**: `http://localhost:3000` (development)

**Authentication** → **URL Configuration**:
- **Site URL**: `http://localhost:3000`
- **Redirect URLs**: 
  - `http://localhost:3000/auth/callback`
  - `https://your-vercel-domain.vercel.app/auth/callback`

### **5. Test Complete Flow**

```bash
# 1. Start server
npm run dev

# 2. Test in browser
# Go to: http://localhost:3000/login
# Try to register with: test@example.com / SecurePass123!

# 3. Check console for detailed logging
# Should see: "✅ AuthProvider: Login successful, user set"
```

### **6. Troubleshooting**

Als je nog steeds errors krijgt:

1. **Check Supabase Dashboard logs**:
   - **Authentication** → **Logs**
   - Kijk naar recent auth attempts

2. **Check browser console**:
   - Ignore MutationObserver errors (browser extensions)
   - Focus on auth-related errors

3. **Check server logs**:
   - `🔐 Using service/anon key for auth`
   - `🔐 Attempting login/registration for: email`

## 🎯 **Expected Results**

Na deze setup:
- ✅ Registration: 200 met user data
- ✅ Login: 200 met session data  
- ✅ No 401 errors (behalve bij wrong credentials)
- ✅ Profile creation: Automatic

## 🚀 **Production Setup**

Voor production (later):
- **Enable email confirmations**: ON
- **Site URL**: `https://stratalia.vercel.app`
- **SMTP**: Configure email provider
