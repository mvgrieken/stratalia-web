# Stratalia Mobile App

Een React Native app voor het leren van Nederlandse straattaal, gebouwd met Expo.

## Features

- 🔐 **Authenticatie**: Inloggen en registreren met Supabase Auth
- 🔍 **Zoekfunctie**: Zoek straattaalwoorden met audio uitspraak
- 🧠 **Quiz**: Test je kennis (binnenkort beschikbaar)
- 📅 **Woord van de Dag**: Dagelijks nieuw woord (binnenkort beschikbaar)
- 👤 **Profiel**: Gebruikersprofiel en uitloggen
- 📱 **Offline Caching**: AsyncStorage voor offline functionaliteit

## Setup

1. **Installeer dependencies:**
   ```bash
   npm install
   ```

2. **Configureer Supabase:**
   - Open `lib/supabase.ts`
   - Vervang `YOUR_SUPABASE_URL` en `YOUR_SUPABASE_ANON_KEY` met je echte Supabase credentials

3. **Start de app:**
   ```bash
   npm start
   ```

4. **Run op device:**
   - Scan de QR code met Expo Go app
   - Of run `npm run ios` / `npm run android`

## API Integratie

De app integreert met de Stratalia web API:
- **Zoekfunctie**: `https://www.stratalia.nl/api/words/search`
- **Authenticatie**: Supabase Auth
- **Gamification**: Punten en levels (binnenkort)

## Offline Functionaliteit

- AsyncStorage voor lokale data opslag
- Cached zoekresultaten
- Offline gebruikersprofiel

## Toekomstige Features

- [ ] Quiz functionaliteit
- [ ] Woord van de dag
- [ ] Push notificaties
- [ ] Offline quiz
- [ ] Gamification (punten, levels, streaks)
- [ ] Leaderboard
- [ ] Challenges

## Technologieën

- **React Native** met Expo
- **TypeScript** voor type safety
- **Supabase** voor authenticatie en database
- **AsyncStorage** voor offline opslag
- **Expo Speech** voor audio uitspraak
