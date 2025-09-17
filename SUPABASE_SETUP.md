# Supabase Setup voor Stratalia

## 🚨 Probleem
De registratie en login functionaliteit werkt niet op de live site omdat de Supabase omgevingsvariabelen niet zijn geconfigureerd.

## 🔧 Oplossing

### 1. Supabase Project Setup
1. Ga naar [Supabase Dashboard](https://supabase.com/dashboard)
2. Maak een nieuw project aan of gebruik een bestaand project
3. Ga naar **Settings > API**
4. Kopieer de volgende waarden:
   - **Project URL** (NEXT_PUBLIC_SUPABASE_URL)
   - **anon public** key (NEXT_PUBLIC_SUPABASE_ANON_KEY)
   - **service_role** key (SUPABASE_SERVICE_KEY)

### 2. Vercel Environment Variables
1. Ga naar je [Vercel Dashboard](https://vercel.com/dashboard)
2. Selecteer je Stratalia project
3. Ga naar **Settings > Environment Variables**
4. Voeg de volgende variabelen toe:

```
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
SUPABASE_SERVICE_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
ADMIN_TOKEN=your_secure_admin_token_here
```

### 3. Database Schema
Zorg ervoor dat je Supabase database de volgende tabellen heeft:

```sql
-- Profiles table
CREATE TABLE profiles (
  id UUID REFERENCES auth.users(id) PRIMARY KEY,
  email TEXT,
  full_name TEXT,
  role TEXT DEFAULT 'user',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- User points table
CREATE TABLE user_points (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES profiles(id),
  total_points INTEGER DEFAULT 0,
  current_level INTEGER DEFAULT 1,
  current_streak INTEGER DEFAULT 0,
  longest_streak INTEGER DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Knowledge items table
CREATE TABLE knowledge_items (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  type TEXT NOT NULL,
  title TEXT NOT NULL,
  content TEXT,
  author TEXT,
  category TEXT,
  tags TEXT[],
  difficulty TEXT,
  description TEXT,
  word_count INTEGER,
  duration TEXT,
  video_url TEXT,
  audio_url TEXT,
  thumbnail_url TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);
```

### 4. Row Level Security (RLS)
Zet RLS aan en configureer policies:

```sql
-- Enable RLS
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_points ENABLE ROW LEVEL SECURITY;
ALTER TABLE knowledge_items ENABLE ROW LEVEL SECURITY;

-- Profiles policies
CREATE POLICY "Users can view their own profile" ON profiles
  FOR SELECT USING (auth.uid() = id);

CREATE POLICY "Users can update their own profile" ON profiles
  FOR UPDATE USING (auth.uid() = id);

-- User points policies
CREATE POLICY "Users can view their own points" ON user_points
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can update their own points" ON user_points
  FOR UPDATE USING (auth.uid() = user_id);

-- Knowledge items policies (public read)
CREATE POLICY "Anyone can view knowledge items" ON knowledge_items
  FOR SELECT USING (true);
```

### 5. Admin Setup
Om een admin gebruiker te maken:

1. Registreer een normale gebruiker via de app
2. Ga naar Supabase Dashboard > Authentication > Users
3. Zoek je gebruiker
4. Ga naar Database > profiles
5. Update de `role` kolom van `user` naar `admin`

### 6. Deployment
1. Na het instellen van de environment variables, redeploy je project
2. Test de registratie en login functionaliteit
3. Test de admin functionaliteit (als nodig)

## 🔒 Security Notes

- **SUPABASE_SERVICE_KEY** is zeer gevoelig - gebruik alleen server-side
- **ADMIN_TOKEN** moet een sterke, willekeurige string zijn
- Zet nooit gevoelige keys in client-side code
- Gebruik RLS policies om data toegang te beperken

## 🐛 Troubleshooting

### Registratie werkt niet
- Controleer of alle Supabase environment variables zijn ingesteld
- Check Vercel logs voor foutmeldingen
- Verificeer dat Supabase project actief is

### Admin functionaliteit werkt niet
- Controleer of ADMIN_TOKEN is ingesteld
- Verificeer dat gebruiker admin rol heeft in database
- Check of Supabase service key correct is

### Database errors
- Controleer of alle tabellen bestaan
- Verificeer RLS policies
- Check database permissions

## 📚 Links

- [Supabase Documentation](https://supabase.com/docs)
- [Vercel Environment Variables](https://vercel.com/docs/concepts/projects/environment-variables)
- [Supabase Auth](https://supabase.com/docs/guides/auth)
- [Row Level Security](https://supabase.com/docs/guides/auth/row-level-security)