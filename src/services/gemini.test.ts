import { analyzeRepoWithGemini } from './gemini';
import { GeminiAnalysisRequest } from '../types/gemini';

// Mock the VertexAI module
jest.mock('@google-cloud/vertexai');

describe('Gemini Service', () => {
  it('should parse Gemini response correctly', async () => {
    const mockRequest: GeminiAnalysisRequest = {
      repoUrl: 'https://github.com/test/repo',
      commits: [{ message: 'optimize build', author: 'dev', date: '2026-03-12' }],
      readme: 'Test README',
      fileTree: [{ path: 'src/index.ts', type: 'file' }],
      languages: { TypeScript: 100 },
      mode: 'preview',
    };

    // Mock will be configured in __mocks__ folder
    const result = await analyzeRepoWithGemini(mockRequest);

    expect(result.dimensions).toBeDefined();
    expect(Object.keys(result.dimensions).length).toBeGreaterThan(0);
  });
});
