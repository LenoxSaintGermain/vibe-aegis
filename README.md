# Vibe A.E.G.I.S.

**GitHub Repository Tarot Reader + A.E.G.I.S. Security Scanner**

Viral marketing funnel combining personality analysis (10 coding archetypes) with security vulnerability mapping (A.E.G.I.S. Standard).

## Architecture

- **Platform**: Google Cloud Run
- **Analysis**: Gemini 3 Flash
- **Storage**: Firestore
- **GitHub**: Octokit REST API

## Development

```bash
npm install
npm run dev  # http://localhost:3000
```

## Deployment

```bash
gcloud run deploy vibe-aegis \
  --source . \
  --region us-central1 \
  --allow-unauthenticated
```

## License

© 2026 Third Signal. All rights reserved.
