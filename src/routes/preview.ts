// src/routes/preview.ts
import { Router, Request, Response } from 'express';
import { fetchRepoData } from '../services/github';
import { analyzeRepoWithGemini } from '../services/gemini';
import { getCachedAnalysis, setCachedAnalysis } from '../services/cache';
import { CardResult } from '../types/firestore';
import { DIMENSIONS } from '../types/gemini';

const router = Router();

router.post('/preview', async (req: Request, res: Response) => {
  try {
    const { repoUrl } = req.body;

    if (!repoUrl || typeof repoUrl !== 'string') {
      return res.status(400).json({ error: 'Invalid repoUrl' });
    }

    // Fetch repo data (preview mode: 50 commits, depth 2)
    const repoData = await fetchRepoData(repoUrl, 'preview');

    // Check cache
    const cached = await getCachedAnalysis(repoUrl, repoData.lastCommitSHA);
    if (cached) {
      const previewCards = cached.cards.slice(0, 3);
      return res.json({
        cards: previewCards,
        analysisId: cached.cacheKey,
        cacheHit: true,
      });
    }

    // Analyze with Gemini
    const geminiResponse = await analyzeRepoWithGemini({
      repoUrl,
      commits: repoData.commits.map((c) => ({
        message: c.message,
        author: c.author,
        date: c.date,
      })),
      readme: repoData.readme,
      fileTree: repoData.fileTree,
      languages: repoData.metadata.languages,
      mode: 'preview',
    });

    // Convert dimensions to CardResult[]
    const cards: CardResult[] = DIMENSIONS.map((dimension) => {
      const result = geminiResponse.dimensions[dimension];
      return {
        dimension,
        score: result?.score || 0,
        evidence: result?.evidence || 'No evidence available',
      };
    })
      .sort((a, b) => b.score - a.score); // Highest scores first

    // NOTE: Preview mode analyzes all 10 dimensions for cache warm-up
    // This allows full reading to hit cache instead of re-analyzing
    // Trade-off: Preview takes ~8-10s instead of ~5s, but full reading becomes instant
    await setCachedAnalysis(repoUrl, repoData.lastCommitSHA, cards, null);

    // Return top 3 cards for preview
    const previewCards = cards.slice(0, 3);
    const analysisId = `${repoData.owner}-${repoData.repo}-${Date.now()}`;

    res.json({
      cards: previewCards,
      analysisId,
      cacheHit: false,
    });
  } catch (error: any) {
    console.error('Preview error:', error);

    if (error.message === 'Invalid GitHub URL') {
      return res.status(400).json({ error: 'Invalid GitHub URL format' });
    }

    if (error.status === 404) {
      return res.status(404).json({ error: 'Repository not found or private' });
    }

    res.status(500).json({ error: 'Analysis failed', details: error.message });
  }
});

export default router;
