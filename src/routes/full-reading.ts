import { Router, Request, Response } from 'express';
import { Timestamp } from '@google-cloud/firestore';
import { getCachedAnalysis, setCachedAnalysis } from '../services/cache';
import { fetchRepoData } from '../services/github';
import { analyzeRepoWithGemini } from '../services/gemini';
import { collections } from '../config/firestore';
import { VibeLeadDoc, CardResult } from '../types/firestore';
import { DIMENSIONS } from '../types/gemini';

const router = Router();

interface FullReadingRequest {
  repoUrl: string;
  email: string;
  analysisId?: string;
}

/**
 * POST /api/full-reading
 *
 * Unlocks the full 10-card reading for a repository.
 * Stores lead in Firestore and returns all personality cards.
 */
router.post('/full-reading', async (req: Request, res: Response) => {
  try {
    const { repoUrl, email, analysisId } = req.body as FullReadingRequest;

    // Validate email
    if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      return res.status(400).json({ error: 'Invalid email address' });
    }

    // Validate repo URL
    if (!repoUrl || typeof repoUrl !== 'string') {
      return res.status(400).json({ error: 'Invalid repository URL' });
    }

    // Fetch repo data in full mode (200 commits, depth 10)
    const repoData = await fetchRepoData(repoUrl, 'full');

    // Try to get cached analysis
    let cachedAnalysis = await getCachedAnalysis(repoUrl, repoData.lastCommitSHA);

    let allCards: CardResult[];

    if (cachedAnalysis) {
      // Cache hit - return all 10 cards
      allCards = cachedAnalysis.cards;
    } else {
      // Cache miss - analyze with Gemini in full mode
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
        mode: 'full',
      });

      // Convert dimensions to CardResult[]
      allCards = DIMENSIONS.map((dimension) => {
        const result = geminiResponse.dimensions[dimension];
        return {
          dimension,
          score: result?.score || 0,
          evidence: result?.evidence || 'No evidence available',
        };
      }).sort((a, b) => b.score - a.score); // Highest scores first

      // Cache the full analysis
      await setCachedAnalysis(repoUrl, repoData.lastCommitSHA, allCards, null);
    }

    // Store lead in Firestore
    const leadDoc: VibeLeadDoc = {
      email,
      repoUrl,
      timestamp: Timestamp.now(),
      previewCards: allCards.slice(0, 3).map((c) => c.dimension), // Top 3 dimensions as strings
      analysisId: analysisId || `${repoUrl}-${Date.now()}`,
      source: 'direct',
    };

    await collections.vibeLeads.add(leadDoc);

    // Return all 10 cards
    return res.json({ cards: allCards });
  } catch (error) {
    console.error('Full reading error:', error);

    if (error instanceof Error) {
      if (error.message.includes('rate limit')) {
        return res.status(429).json({ error: 'Rate limit exceeded. Please try again later.' });
      }
      if (error.message.includes('GitHub')) {
        return res.status(400).json({ error: error.message });
      }
    }

    return res.status(500).json({ error: 'Failed to generate full reading' });
  }
});

export default router;
