import { VertexAI } from '@google-cloud/vertexai';
import { GeminiAnalysisRequest, GeminiAnalysisResponse, DIMENSIONS } from '../types/gemini';

const projectId = process.env.GEMINI_PROJECT_ID || 'orbital-prod';
const location = process.env.GEMINI_LOCATION || 'us-central1';

const vertexAI = new VertexAI({ project: projectId, location });

export async function analyzeRepoWithGemini(
  request: GeminiAnalysisRequest
): Promise<GeminiAnalysisResponse> {
  const model = vertexAI.getGenerativeModel({
    model: 'gemini-3-flash',
  });

  const prompt = buildAnalysisPrompt(request);

  const result = await model.generateContent({
    contents: [{ role: 'user', parts: [{ text: prompt }] }],
    generationConfig: {
      maxOutputTokens: 2000,
      temperature: 0.7,
    },
  });

  const response = result.response;
  const text = response.candidates?.[0]?.content?.parts?.[0]?.text || '{}';

  // Parse JSON response
  const jsonMatch = text.match(/\{[\s\S]*\}/);
  const parsed = jsonMatch ? JSON.parse(jsonMatch[0]) : {};

  return { dimensions: parsed };
}

function buildAnalysisPrompt(request: GeminiAnalysisRequest): string {
  const commitSample = request.commits.slice(0, request.mode === 'preview' ? 10 : 50);

  return `Analyze this GitHub repository and score these 10 coding personality dimensions (0-100):

${DIMENSIONS.map((d, i) => `${i + 1}. ${d}`).join('\n')}

Repository Data:
- URL: ${request.repoUrl}
- Languages: ${JSON.stringify(request.languages)}
- Recent commits (${commitSample.length}):
${commitSample.map((c) => `  - "${c.message}" by ${c.author}`).join('\n')}
- README excerpt (first 500 chars):
${request.readme.slice(0, 500)}
- File structure:
${request.fileTree.slice(0, 20).map((f) => `  - ${f.path}`).join('\n')}

Scoring Guidelines:
- Sovereign Architect: Clear vision, consistent patterns, architectural clarity
- Compression Obsessive: Token efficiency, minimalism, commits with "reduce"/"optimize"
- Infrastructure Mystic: Docker/k8s presence, CI/CD sophistication
- Cinematic Systems Builder: Design system, visual polish, UX focus
- Dual-Write Philosopher: Fallback patterns, resilience, error handling
- Strategic Documentarian: README quality, comment density, docs/ folder
- Market Whisperer: Product thinking, user-first language
- Agent-First Visionary: AI/LLM integration, agentic patterns
- Anti-Bloat Warrior: Low dependency count, tree-shaking, bundle optimization
- Codename Conjurer: Creative naming, semantic clarity, poetic variables

Return ONLY valid JSON (no markdown):
{
  "Sovereign Architect": { "score": 85, "evidence": "Consistent MVC pattern across 47 files" },
  "Compression Obsessive": { "score": 72, "evidence": "12 commits mention 'optimize' or 'reduce'" },
  ...
}`;
}
