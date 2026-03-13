import { Firestore } from '@google-cloud/firestore';

const projectId = process.env.FIREBASE_PROJECT_ID || 'orbital-prod'; // Reuse Orbital's project

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
