# Vibe A.E.G.I.S. 🔮

**GitHub Repository Personality Reader** - Mystical tarot-themed AI analysis powered by Gemini 3 Flash

Analyze any GitHub repository and discover its coding personality across 10 mystical dimensions:
- 🏛️ Sovereign Architect
- 🗜️ Compression Obsessive
- ⚡ Infrastructure Mystic
- 🎬 Cinematic Systems Builder
- ✍️ Dual-Write Philosopher
- 📚 Strategic Documentarian
- 💰 Market Whisperer
- 🤖 Agent-First Visionary
- 🚫 Anti-Bloat Warrior
- ✨ Codename Conjurer

## Architecture

- **Frontend**: Vanilla JavaScript with mystical tarot UI (copper/emerald theme)
- **Backend**: Express.js + TypeScript
- **AI Analysis**: Google Gemini 3 Flash via Vertex AI
- **GitHub Data**: Octokit REST API (unauthenticated, 60 req/hr limit)
- **Caching**: Firestore with SHA-256 keys & 7-day TTL
- **Deployment**: Google Cloud Run with auto-scaling

## API Endpoints

### `POST /api/preview`
Returns top 3 personality cards for a GitHub repository.

**Request:**
```json
{
  "repoUrl": "https://github.com/vercel/next.js"
}
```

**Response:**
```json
{
  "cards": [
    {
      "dimension": "Sovereign Architect",
      "score": 92,
      "evidence": "Consistent architectural patterns across 847 files"
    }
  ],
  "analysisId": "abc-123",
  "cacheHit": false
}
```

### `POST /api/full-reading`
Unlocks all 10 personality cards (requires email).

**Request:**
```json
{
  "repoUrl": "https://github.com/vercel/next.js",
  "email": "user@example.com",
  "analysisId": "abc-123"
}
```

**Response:**
```json
{
  "cards": []
}
```

## Environment Variables

Required for Cloud Run deployment:

```bash
GEMINI_PROJECT_ID=your-gcp-project-id
GEMINI_LOCATION=us-central1
GOOGLE_APPLICATION_CREDENTIALS=/path/to/service-account-key.json
PORT=8080
```

### Setting up Firestore

1. Enable Firestore in your GCP project
2. Create the following collections (created automatically on first write):
   - `analysis_cache` - Cached personality analysis results
   - `vibe_leads` - Email captures from full readings
   - `skill_pack_backlog` - Future feature (Phase 2)
   - `error_log` - Error tracking

### Setting up Gemini

1. Enable Vertex AI API in your GCP project
2. Create a service account with `Vertex AI User` role
3. Download the service account key JSON
4. Set `GOOGLE_APPLICATION_CREDENTIALS` environment variable

## Local Development

```bash
# Install dependencies
npm install

# Run in development mode
npm run dev

# Run tests
npm test

# Build for production
npm run build

# Start production server
npm start
```

## Deployment to Cloud Run

### Option 1: Manual Deployment
```bash
gcloud run deploy vibe-aegis \
  --source . \
  --region us-central1 \
  --allow-unauthenticated \
  --set-env-vars GEMINI_PROJECT_ID=your-project-id,GEMINI_LOCATION=us-central1
```

### Option 2: Continuous Deployment from GitHub

1. **Connect GitHub repository to Cloud Build:**
```bash
gcloud builds triggers create github \
  --repo-name=vibe-aegis \
  --repo-owner=LenoxSaintGermain \
  --branch-pattern="^master$" \
  --build-config=cloudbuild.yaml \
  --region=us-central1
```

2. **Configure environment variables in Cloud Run:**
```bash
gcloud run services update vibe-aegis \
  --region us-central1 \
  --set-env-vars GEMINI_PROJECT_ID=your-project-id,GEMINI_LOCATION=us-central1
```

3. **Push to GitHub to trigger automatic deployment:**
```bash
git push origin master
```

## Cache Strategy

**Preview Mode (3-card reading):**
- Analyzes all 10 dimensions but returns only top 3
- Caches full analysis for 7 days
- Trade-off: Preview takes 8-10s, but full reading is instant (cache hit)

**Full Reading Mode:**
- First checks cache using `repoUrl:lastCommitSHA` key
- Cache hit: Returns all 10 cards immediately
- Cache miss: Analyzes with Gemini, caches result, returns cards
- Updates invalidate cache automatically (new commit SHA)

## Test Coverage

- **18 tests** across 6 test suites
- Full reading endpoint: 8/8 tests
- Services: cache (4/4), GitHub (3/3), Gemini (3/3)

Run tests:
```bash
npm test
```

## Tech Stack

- **Runtime**: Node.js 20+
- **Language**: TypeScript 5.9
- **Framework**: Express.js
- **AI**: Google Gemini 3 Flash (gemini-3-flash)
- **Database**: Google Cloud Firestore
- **GitHub API**: Octokit REST v21
- **Testing**: Jest + Supertest
- **Deployment**: Docker + Cloud Run

## Performance

- **Preview**: 8-10 seconds (Gemini analysis)
- **Full Reading (cache hit)**: <100ms
- **Full Reading (cache miss)**: 8-10 seconds
- **Cache TTL**: 7 days
- **Rate Limits**: GitHub 60 req/hr (unauthenticated)

## Future Phases

- **Phase 2**: A.E.G.I.S. Security Vulnerability Map
- **Phase 3**: Third Signal Skill Pack Recommendations
- **Phase 4**: Social sharing & leaderboards

## License

© 2026 Third Signal. All rights reserved.

---

Built with ✨ by [Third Signal](https://thirdsignal.ai) using the A.E.G.I.S. Standard v1.0
