import { Firestore } from '@google-cloud/firestore';

// Use GEMINI_PROJECT_ID for consistency (set in Cloud Run environment)
const projectId = process.env.GEMINI_PROJECT_ID || process.env.FIREBASE_PROJECT_ID || 'third-signal';

export const firestore = new Firestore({
  projectId,
  // Uses Application Default Credentials (automatic on Cloud Run)
});

export const collections = {
  analysisCache: firestore.collection('analysis_cache'),
  vibeLeads: firestore.collection('vibe_leads'),
  skillPackBacklog: firestore.collection('skill_pack_backlog'),
  errorLog: firestore.collection('error_log'),
} as const;
