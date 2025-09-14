# 🧪 Post-Deployment Test Checklist

## API Endpoints Tests

### 1. Search API Test
```bash
# Test basic search
curl "https://your-app.vercel.app/api/words/search?query=skeer&limit=5"

# Expected Response:
# - Status: 200
# - Content-Type: application/json
# - Array of word objects with: id, word, definition, example
# - Should find "skeer" with definition "arm, weinig geld hebben"
```

### 2. Daily Word API Test
```bash
# Test word of the day
curl "https://your-app.vercel.app/api/words/daily"

# Expected Response:
# - Status: 200
# - Content-Type: application/json
# - Object with: id, word, definition, example, date
# - Should be a valid word from database
```

### 3. Admin Content API Test
```bash
# Test admin content (should show pending items)
curl "https://your-app.vercel.app/api/admin/content"

# Expected Response:
# - Status: 200
# - Content-Type: application/json
# - Array of content objects
# - Should show 8 pending items from database
```

### 4. AI Translate API Test
```bash
# Test translation
curl -X POST "https://your-app.vercel.app/api/ai/translate" \
  -H "Content-Type: application/json" \
  -d '{"text": "skeer", "direction": "to_formal"}'

# Expected Response:
# - Status: 200
# - Content-Type: application/json
# - Object with: translation, confidence, alternatives, explanation
```

### 5. Quiz API Test
```bash
# Test quiz generation
curl "https://your-app.vercel.app/api/quiz?difficulty=medium&limit=3"

# Expected Response:
# - Status: 200
# - Content-Type: application/json
# - Array of quiz questions with: id, word, question_text, correct_answer, wrong_answers
```

## Frontend Tests

### 1. Homepage Load Test
- [ ] App laadt zonder errors
- [ ] Search bar is zichtbaar en functioneel
- [ ] Word of the Day sectie is zichtbaar
- [ ] Navigation werkt correct

### 2. Search Functionality
- [ ] Zoek naar "skeer" → toont resultaten
- [ ] Zoek naar "fissa" → toont resultaten
- [ ] Zoek naar "waggie" → toont resultaten
- [ ] Autocomplete werkt voor "ske"
- [ ] "Geen resultaten" voor onbekende woorden

### 3. Word of the Day
- [ ] Dagelijks woord wordt getoond
- [ ] Definitie is zichtbaar
- [ ] Voorbeeldzin is zichtbaar
- [ ] Refresh toont nieuw woord

### 4. Admin Panel (voor admin users)
- [ ] CMS-knop is zichtbaar
- [ ] Admin panel laadt
- [ ] Pending content items zijn zichtbaar (8 items)
- [ ] Approve/reject functionaliteit werkt
- [ ] Batch operations werken

### 5. Gamification Features
- [ ] Points systeem werkt
- [ ] Level progression werkt
- [ ] Quiz scores worden opgeslagen
- [ ] Leaderboard is zichtbaar

## Performance Tests

### 1. API Response Times
- [ ] Search API < 1 seconde
- [ ] Daily Word API < 1 seconde
- [ ] Admin Content API < 1 seconde
- [ ] AI Translate API < 2 seconden

### 2. Frontend Performance
- [ ] Homepage laadt < 3 seconden
- [ ] Search results < 1 seconde
- [ ] Smooth scrolling en interactions
- [ ] No console errors

## Security Tests

### 1. Environment Variables
- [ ] SUPABASE_SERVICE_KEY niet in client-side code
- [ ] Alleen NEXT_PUBLIC_* variabelen zichtbaar
- [ ] Geen hardcoded secrets in code

### 2. API Security
- [ ] CORS headers correct geconfigureerd
- [ ] Admin endpoints vereisen authenticatie
- [ ] Input validation werkt
- [ ] Error messages geen sensitive data

## Database Tests

### 1. Data Integrity
- [ ] 256+ woorden in database
- [ ] Seed words aanwezig: skeer, fissa, waggie, matties, loesoe
- [ ] 8 pending content items
- [ ] User profiles en quiz results

### 2. Search Functionality
- [ ] Fuzzy search werkt voor "skeerr"
- [ ] Phonetic search werkt
- [ ] Case-insensitive search
- [ ] Partial word matching

## Error Handling Tests

### 1. API Error Responses
- [ ] 404 voor onbekende endpoints
- [ ] 400 voor invalid requests
- [ ] 500 voor server errors
- [ ] Proper error messages

### 2. Frontend Error Handling
- [ ] Network errors worden afgehandeld
- [ ] Loading states zijn zichtbaar
- [ ] Error messages zijn user-friendly
- [ ] Fallback content wordt getoond

## Mobile Responsiveness

### 1. Mobile Layout
- [ ] App werkt op mobile devices
- [ ] Touch interactions werken
- [ ] Text is leesbaar
- [ ] Buttons zijn touch-friendly

### 2. Cross-Browser Compatibility
- [ ] Chrome werkt
- [ ] Safari werkt
- [ ] Firefox werkt
- [ ] Edge werkt

## Final Checklist

- [ ] Alle API endpoints werken
- [ ] Frontend functionaliteit compleet
- [ ] Performance binnen acceptabele limieten
- [ ] Security best practices geïmplementeerd
- [ ] Error handling robuust
- [ ] Mobile responsive
- [ ] Cross-browser compatible
- [ ] Database integratie stabiel
- [ ] Admin panel functioneel
- [ ] Gamification features werken

## Test Results Summary

| Test Category | Status | Notes |
|---------------|--------|-------|
| API Endpoints | ⏳ | Test na deployment |
| Frontend | ⏳ | Test na deployment |
| Performance | ⏳ | Test na deployment |
| Security | ✅ | Pre-deployment check passed |
| Database | ✅ | Pre-deployment check passed |
| Error Handling | ✅ | Pre-deployment check passed |
| Mobile | ⏳ | Test na deployment |
| Cross-Browser | ⏳ | Test na deployment |

**Overall Status:** Ready for deployment testing
