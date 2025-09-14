# Supabase RLS Policies - Stratalia

## Overzicht
Dit document beschrijft de Row Level Security (RLS) policies die zijn ingesteld voor de Stratalia applicatie. Deze policies bepalen welke gebruikers toegang hebben tot welke data.

## Belangrijke Tabellen voor Anonieme Toegang

### 1. `words` - Straattaal Woorden
**Policies:**
- `"Words are publicly viewable"` - `{anon,authenticated}` - `SELECT` - `(is_active = true)`
- `"words_select_all"` - `{public}` - `SELECT` - `true`

**Toegang:** Anonieme gebruikers kunnen alle actieve woorden lezen.

### 2. `word_of_the_day` - Dagelijks Woord
**Policies:**
- `"word_of_the_day_select_all"` - `{public}` - `SELECT` - `true`

**Toegang:** Anonieme gebruikers kunnen het dagelijkse woord lezen.

### 3. `word_variants` - Woord Varianten
**Policies:**
- `"Allow read access to word_variants"` - `{public}` - `SELECT` - `true`

**Toegang:** Anonieme gebruikers kunnen woord varianten lezen.

### 4. `content_updates` - Content Updates
**Policies:**
- `"community_contributions_select_own"` - `{public}` - `SELECT` - `((auth.uid() = user_id) OR (auth.uid() = moderator_id) OR (user_id IS NULL))`

**Toegang:** Anonieme gebruikers kunnen content updates lezen waar `user_id IS NULL`.

## Authenticated User Policies

### 5. `profiles` - Gebruikersprofielen
**Policies:**
- `"Users can view own profile"` - `{public}` - `SELECT` - `(id = auth.uid())`
- `"Users can update own profile"` - `{public}` - `UPDATE` - `(id = auth.uid())`

**Toegang:** Gebruikers kunnen alleen hun eigen profiel bekijken en bewerken.

### 6. `user_progress` - Gebruikersvoortgang
**Policies:**
- `"user_progress_select_own_optimized"` - `{public}` - `SELECT` - `(( SELECT auth.uid() AS uid) = user_id)`
- `"user_progress_update_own_optimized"` - `{public}` - `UPDATE` - `(( SELECT auth.uid() AS uid) = user_id)`

**Toegang:** Gebruikers kunnen alleen hun eigen voortgang bekijken en bijwerken.

## Admin Policies

### 7. `new_words` - Nieuwe Woorden
**Policies:**
- `"new_words_select_all"` - `{public}` - `SELECT` - `true`
- `"new_words_insert_service"` - `{public}` - `INSERT` - `null`
- `"new_words_update_moderator"` - `{public}` - `UPDATE` - `(auth.uid() = moderator_id)`

**Toegang:** Iedereen kan nieuwe woorden lezen, moderators kunnen ze bijwerken.

## Service Role Policies

### 8. `users` - Gebruikers
**Policies:**
- `"Service role can manage users"` - `{public}` - `ALL` - `true`

**Toegang:** Service role heeft volledige toegang tot gebruikers.

## Veiligheidsmaatregelen

1. **Anonieme Toegang:** Alleen leesrechten voor publieke content
2. **Authenticated Users:** Alleen toegang tot eigen data
3. **Moderators:** Kunnen content modereren
4. **Admins:** Volledige toegang waar nodig
5. **Service Role:** Volledige toegang voor systeemoperaties

## Testen van Policies

```sql
-- Test anonieme toegang
SET ROLE anon;
SELECT * FROM words WHERE is_active = true LIMIT 5;

-- Test authenticated toegang
SET ROLE authenticated;
SELECT * FROM profiles WHERE id = auth.uid();

-- Reset naar service role
SET ROLE service_role;
```

## Belangrijke Opmerkingen

- Alle policies gebruiken `{public}` rol, wat betekent dat ze gelden voor zowel `anon` als `authenticated` gebruikers
- Anonieme gebruikers hebben alleen leesrechten voor publieke content
- Authenticated gebruikers kunnen alleen hun eigen data beheren
- Service role heeft volledige toegang voor systeemoperaties
