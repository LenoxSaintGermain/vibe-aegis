export interface GeminiAnalysisRequest {
  repoUrl: string;
  commits: CommitData[];
  readme: string;
  fileTree: FileNode[];
  languages: Record<string, number>;
  mode: 'preview' | 'full';
}

export interface CommitData {
  message: string;
  author: string;
  date: string;
}

export interface FileNode {
  path: string;
  type: 'file' | 'dir';
}

export interface GeminiAnalysisResponse {
  dimensions: Record<string, DimensionScore>;
}

export interface DimensionScore {
  score: number;
  evidence: string;
}

export const DIMENSIONS = [
  'Sovereign Architect',
  'Compression Obsessive',
  'Infrastructure Mystic',
  'Cinematic Systems Builder',
  'Dual-Write Philosopher',
  'Strategic Documentarian',
  'Market Whisperer',
  'Agent-First Visionary',
  'Anti-Bloat Warrior',
  'Codename Conjurer',
] as const;
