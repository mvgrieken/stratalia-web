# 🔐 Authentication Deployment Checklist

## Vercel Environment Variables

Zorg dat de volgende environment variabelen correct zijn ingesteld in Vercel:

### ✅ Verplichte Variabelen
- [ ] `NEXT_PUBLIC_SUPABASE_URL` - Je Supabase project URL
- [ ] `NEXT_PUBLIC_SUPABASE_ANON_KEY` - Je Supabase anon key  
- [ ] `SUPABASE_SERVICE_KEY` - Je Supabase service role key (NIET de anon key!)

### 🔍 Hoe te controleren:

1. **Ga naar Vercel Dashboard**
2. **Selecteer je project** (stratalia-web)
3. **Ga naar Settings > Environment Variables**
4. **Controleer of alle variabelen aanwezig zijn**

### 🚨 Veelvoorkomende Problemen:

#### Probleem: "Server configuration error"
**Oorzaak:** `SUPABASE_SERVICE_KEY` ontbreekt of is incorrect
**Oplossing:** 
- Zorg dat `SUPABASE_SERVICE_KEY` is ingesteld (niet `SUPABASE_SERVICE_ROLE_KEY`)
- Gebruik de service role key uit je Supabase dashboard (Settings > API)

#### Probleem: "Invalid credentials" 
**Oorzaak:** Verkeerde anon key of service key
**Oplossing:**
- Controleer of je de juiste keys gebruikt uit Supabase
- Zorg dat de keys niet zijn geëxpired

#### Probleem: "User already registered"
**Oorzaak:** E-mailadres bestaat al in database
**Oplossing:** Dit is normaal gedrag - gebruiker moet inloggen in plaats van registreren

## 🧪 Testing na Deployment

### 1. Test Login Flow
- [ ] Ga naar `/login`
- [ ] Voer geldige credentials in
- [ ] Controleer of je wordt doorgestuurd naar dashboard
- [ ] Controleer of foutmeldingen gebruiksvriendelijk zijn

### 2. Test Registration Flow  
- [ ] Ga naar `/register`
- [ ] Voer nieuwe gebruiker gegevens in
- [ ] Controleer of registratie succesvol is
- [ ] Controleer of je wordt doorgestuurd naar dashboard

### 3. Test Error Handling
- [ ] Test met ongeldige credentials
- [ ] Test met bestaand e-mailadres
- [ ] Test met te kort wachtwoord
- [ ] Controleer of foutmeldingen in het Nederlands zijn

### 4. Test Network Errors
- [ ] Test met offline verbinding
- [ ] Controleer of gebruiksvriendelijke foutmeldingen worden getoond

## 🔧 Debugging

### Logs Controleren
```bash
# In Vercel dashboard:
# Functions > View Function Logs
# Zoek naar "❌ Supabase environment variables are missing!"
```

### Environment Variables Testen
```bash
# Voeg tijdelijk toe aan je API route:
console.log('Environment check:', {
  hasUrl: !!process.env.NEXT_PUBLIC_SUPABASE_URL,
  hasAnonKey: !!process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
  hasServiceKey: !!process.env.SUPABASE_SERVICE_KEY
});
```

### Supabase Dashboard Controleren
1. Ga naar je Supabase project
2. Settings > API
3. Controleer of je de juiste keys hebt
4. Controleer of je project actief is

## 📋 Pre-Deployment Checklist

- [ ] Environment variabelen zijn correct ingesteld
- [ ] Supabase project is actief
- [ ] Service role key is correct
- [ ] Anon key is correct
- [ ] Project URL is correct
- [ ] Tests zijn geslaagd
- [ ] Error handling is getest

## 🚀 Post-Deployment Checklist

- [ ] Login werkt correct
- [ ] Registratie werkt correct  
- [ ] Foutmeldingen zijn gebruiksvriendelijk
- [ ] Redirects werken correct
- [ ] Session management werkt
- [ ] Logout werkt correct

## 📞 Support

Als je problemen hebt:
1. Controleer de Vercel function logs
2. Controleer de Supabase logs
3. Test de environment variabelen
4. Controleer de browser console voor errors

---

**Let op:** De app werkt ook zonder Supabase configuratie, maar dan zijn login/registratie niet beschikbaar.
