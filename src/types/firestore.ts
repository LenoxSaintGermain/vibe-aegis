import { Timestamp } from '@google-cloud/firestore';

export interface AnalysisCacheDoc {
  cacheKey: string;
  repoUrl: string;
  lastCommitSHA: string;
  cards: CardResult[];
  vulnerabilities: VulnerabilityMap | null;
  createdAt: Timestamp;
  expiresAt: Timestamp;
}

export interface CardResult {
  dimension: string;
  score: number;
  evidence: string;
}

export interface VulnerabilityMap {
  overallRisk: 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL';
  specs: SpecViolation[];
}

export interface SpecViolation {
  id: string;
  name: string;
  violated: boolean;
  severity: 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL';
  instances: number;
  evidence: EvidenceItem[];
  recommendedPack: SkillPackReference;
}

export interface EvidenceItem {
  file: string;
  line: number;
  description: string;
}

export interface SkillPackReference {
  id: string;
  codename: string;
  status: 'PRODUCTION' | 'POC' | 'SPEC';
}

export interface VibeLeadDoc {
  email: string;
  repoUrl: string;
  timestamp: Timestamp;
  previewCards: string[];
  analysisId: string;
  source: 'direct' | 'share' | 'leaderboard';
}

export interface SkillPackBacklogDoc {
  specViolated: string;
  recommendedPackId: string;
  packStatus: 'PRODUCTION' | 'SPEC';
  requestCount: number;
  firstRequested: Timestamp;
  lastRequested: Timestamp;
}

export interface ErrorLogDoc {
  timestamp: Timestamp;
  repoUrl: string;
  errorType: 'gemini_timeout' | 'gemini_quota' | 'github_rate_limit' | 'invalid_url' | 'private_repo';
  errorDetails: string;
}
