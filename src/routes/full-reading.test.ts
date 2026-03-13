import request from 'supertest';
import express from 'express';
import fullReadingRouter from './full-reading';
import * as cacheService from '../services/cache';
import * as githubService from '../services/github';
import * as geminiService from '../services/gemini';
import { collections } from '../config/firestore';
import { CardResult } from '../types/firestore';

// Mock all external services
jest.mock('../services/cache');
jest.mock('../services/github');
jest.mock('../services/gemini');
jest.mock('../config/firestore', () => ({
  collections: {
    vibeLeads: {
      add: jest.fn(),
    },
  },
}));

const app = express();
app.use(express.json());
app.use('/api', fullReadingRouter);

describe('POST /api/full-reading', () => {
  const mockRepoUrl = 'https://github.com/test/repo';
  const mockEmail = 'test@example.com';
  const mockAnalysisId = 'test-analysis-id';

  const mockRepoData = {
    owner: 'test',
    repo: 'repo',
    description: 'Test repository',
    language: 'TypeScript',
    stars: 100,
    forks: 20,
    openIssues: 5,
    lastCommitSHA: 'abc123',
    commits: [
      { message: 'Initial commit', author: 'test', date: '2024-01-01' },
    ],
    readme: 'Test README',
    fileTree: [{ path: 'src/index.ts', type: 'file' as const }],
    metadata: {
      languages: { TypeScript: 100 },
    },
  };

  const mockCards: CardResult[] = [
    { dimension: 'Sovereign Architect', score: 9, evidence: 'Clear architecture' },
    { dimension: 'Compression Obsessive', score: 8, evidence: 'DRY code' },
    { dimension: 'Infrastructure Mystic', score: 7, evidence: 'Good DevOps' },
    { dimension: 'Cinematic Systems Builder', score: 6, evidence: 'UX focus' },
    { dimension: 'Dual-Write Philosopher', score: 5, evidence: 'Migration patterns' },
    { dimension: 'Strategic Documentarian', score: 4, evidence: 'Some docs' },
    { dimension: 'Market Whisperer', score: 3, evidence: 'User-centric' },
    { dimension: 'Agent-First Visionary', score: 2, evidence: 'AI integration' },
    { dimension: 'Anti-Bloat Warrior', score: 1, evidence: 'Minimal deps' },
    { dimension: 'Codename Conjurer', score: 0, evidence: 'Standard names' },
  ];

  beforeEach(() => {
    jest.clearAllMocks();

    // Default mocks
    (githubService.fetchRepoData as jest.Mock).mockResolvedValue(mockRepoData);
    (cacheService.generateCacheKey as jest.Mock).mockReturnValue('test-cache-key');
  });

  it('should return all 10 cards from cache when available', async () => {
    // Mock cache hit
    (cacheService.getCachedAnalysis as jest.Mock).mockResolvedValue({
      cards: mockCards,
      vulnerabilityMap: null,
    });

    const response = await request(app)
      .post('/api/full-reading')
      .send({ repoUrl: mockRepoUrl, email: mockEmail, analysisId: mockAnalysisId });

    expect(response.status).toBe(200);
    expect(response.body.cards).toEqual(mockCards);
    expect(response.body.cards).toHaveLength(10);

    // Should fetch repo data in full mode
    expect(githubService.fetchRepoData).toHaveBeenCalledWith(mockRepoUrl, 'full');

    // Should check cache
    expect(cacheService.getCachedAnalysis).toHaveBeenCalledWith(mockRepoUrl, 'abc123');

    // Should NOT call Gemini (cache hit)
    expect(geminiService.analyzeRepoWithGemini).not.toHaveBeenCalled();

    // Should store lead
    expect(collections.vibeLeads.add).toHaveBeenCalledWith({
      email: mockEmail,
      repoUrl: mockRepoUrl,
      timestamp: expect.any(Object), // Firestore Timestamp
      previewCards: expect.arrayContaining([
        'Sovereign Architect',
        'Compression Obsessive',
        'Infrastructure Mystic',
      ]), // Top 3 dimension names
      analysisId: expect.any(String),
      source: 'direct',
    });
  });

  it('should analyze with Gemini and cache when cache miss', async () => {
    // Mock cache miss
    (cacheService.getCachedAnalysis as jest.Mock).mockResolvedValue(null);

    // Mock Gemini analysis
    (geminiService.analyzeRepoWithGemini as jest.Mock).mockResolvedValue({
      dimensions: {
        'Sovereign Architect': { score: 9, evidence: 'Clear architecture' },
        'Compression Obsessive': { score: 8, evidence: 'DRY code' },
        'Infrastructure Mystic': { score: 7, evidence: 'Good DevOps' },
        'Cinematic Systems Builder': { score: 6, evidence: 'UX focus' },
        'Dual-Write Philosopher': { score: 5, evidence: 'Migration patterns' },
        'Strategic Documentarian': { score: 4, evidence: 'Some docs' },
        'Market Whisperer': { score: 3, evidence: 'User-centric' },
        'Agent-First Visionary': { score: 2, evidence: 'AI integration' },
        'Anti-Bloat Warrior': { score: 1, evidence: 'Minimal deps' },
        'Codename Conjurer': { score: 0, evidence: 'Standard names' },
      },
    });

    const response = await request(app)
      .post('/api/full-reading')
      .send({ repoUrl: mockRepoUrl, email: mockEmail });

    expect(response.status).toBe(200);
    expect(response.body.cards).toEqual(mockCards);

    // Should analyze with Gemini in full mode
    expect(geminiService.analyzeRepoWithGemini).toHaveBeenCalledWith({
      repoUrl: mockRepoUrl,
      commits: mockRepoData.commits.map((c) => ({
        message: c.message,
        author: c.author,
        date: c.date,
      })),
      readme: mockRepoData.readme,
      fileTree: mockRepoData.fileTree,
      languages: mockRepoData.metadata.languages,
      mode: 'full',
    });

    // Should cache the result
    expect(cacheService.setCachedAnalysis).toHaveBeenCalledWith(
      mockRepoUrl,
      'abc123',
      mockCards,
      null
    );

    // Should store lead
    expect(collections.vibeLeads.add).toHaveBeenCalled();
  });

  it('should reject invalid email addresses', async () => {
    const invalidEmails = ['invalid', 'missing@domain', '@example.com', 'no-at-sign.com', ''];

    for (const email of invalidEmails) {
      const response = await request(app)
        .post('/api/full-reading')
        .send({ repoUrl: mockRepoUrl, email });

      expect(response.status).toBe(400);
      expect(response.body.error).toBe('Invalid email address');
    }
  });

  it('should reject missing or invalid repo URL', async () => {
    const response1 = await request(app)
      .post('/api/full-reading')
      .send({ email: mockEmail });

    expect(response1.status).toBe(400);
    expect(response1.body.error).toBe('Invalid repository URL');

    const response2 = await request(app)
      .post('/api/full-reading')
      .send({ repoUrl: '', email: mockEmail });

    expect(response2.status).toBe(400);
    expect(response2.body.error).toBe('Invalid repository URL');
  });

  it('should handle GitHub API errors', async () => {
    (githubService.fetchRepoData as jest.Mock).mockRejectedValue(
      new Error('GitHub API: Repository not found')
    );

    const response = await request(app)
      .post('/api/full-reading')
      .send({ repoUrl: mockRepoUrl, email: mockEmail });

    expect(response.status).toBe(400);
    expect(response.body.error).toContain('GitHub');
  });

  it('should handle rate limiting', async () => {
    (githubService.fetchRepoData as jest.Mock).mockRejectedValue(
      new Error('GitHub rate limit exceeded')
    );

    const response = await request(app)
      .post('/api/full-reading')
      .send({ repoUrl: mockRepoUrl, email: mockEmail });

    expect(response.status).toBe(429);
    expect(response.body.error).toContain('Rate limit');
  });

  it('should handle Gemini analysis errors', async () => {
    (cacheService.getCachedAnalysis as jest.Mock).mockResolvedValue(null);
    (geminiService.analyzeRepoWithGemini as jest.Mock).mockRejectedValue(
      new Error('Gemini API error')
    );

    const response = await request(app)
      .post('/api/full-reading')
      .send({ repoUrl: mockRepoUrl, email: mockEmail });

    expect(response.status).toBe(500);
    expect(response.body.error).toBe('Failed to generate full reading');
  });

  it('should handle Firestore write errors gracefully', async () => {
    (cacheService.getCachedAnalysis as jest.Mock).mockResolvedValue({
      cards: mockCards,
      vulnerabilityMap: null,
    });

    (collections.vibeLeads.add as jest.Mock).mockRejectedValue(
      new Error('Firestore write failed')
    );

    const response = await request(app)
      .post('/api/full-reading')
      .send({ repoUrl: mockRepoUrl, email: mockEmail });

    expect(response.status).toBe(500);
    expect(response.body.error).toBe('Failed to generate full reading');
  });
});
