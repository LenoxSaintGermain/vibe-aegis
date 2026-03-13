import { createHash } from 'crypto';
import { Timestamp } from '@google-cloud/firestore';
import { collections } from '../config/firestore';
import { AnalysisCacheDoc, CardResult, VulnerabilityMap } from '../types/firestore';

const CACHE_TTL_DAYS = 7;

export function generateCacheKey(repoUrl: string, lastCommitSHA: string): string {
  return createHash('sha256').update(`${repoUrl}:${lastCommitSHA}`).digest('hex');
}

export async function getCachedAnalysis(
  repoUrl: string,
  lastCommitSHA: string
): Promise<AnalysisCacheDoc | null> {
  const cacheKey = generateCacheKey(repoUrl, lastCommitSHA);

  const doc = await collections.analysisCache.doc(cacheKey).get();

  if (!doc.exists) {
    return null;
  }

  const data = doc.data() as AnalysisCacheDoc;

  // Check if expired
  const now = Timestamp.now();
  if (data.expiresAt.toMillis() < now.toMillis()) {
    // Delete expired cache
    await collections.analysisCache.doc(cacheKey).delete();
    return null;
  }

  return data;
}

export async function setCachedAnalysis(
  repoUrl: string,
  lastCommitSHA: string,
  cards: CardResult[],
  vulnerabilities: VulnerabilityMap | null // Always null in Phase 1 MVP (A.E.G.I.S. added in Phase 3)
): Promise<void> {
  const cacheKey = generateCacheKey(repoUrl, lastCommitSHA);

  const now = Timestamp.now();
  const expiresAt = Timestamp.fromMillis(now.toMillis() + CACHE_TTL_DAYS * 24 * 60 * 60 * 1000);

  const cacheDoc: AnalysisCacheDoc = {
    cacheKey,
    repoUrl,
    lastCommitSHA,
    cards,
    vulnerabilities,
    createdAt: now,
    expiresAt,
  };

  await collections.analysisCache.doc(cacheKey).set(cacheDoc);
}
