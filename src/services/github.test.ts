import { fetchRepoData } from './github';

jest.mock('@octokit/rest');

describe('GitHub Service', () => {
  it('should fetch repo data for preview mode', async () => {
    const repoData = await fetchRepoData('https://github.com/vercel/next.js', 'preview');

    expect(repoData.owner).toBe('vercel');
    expect(repoData.repo).toBe('next.js');
    expect(repoData.commits.length).toBeGreaterThan(0);
    expect(repoData.commits.length).toBeLessThanOrEqual(50);
  });

  it('should throw error for invalid URL', async () => {
    await expect(fetchRepoData('invalid-url', 'preview')).rejects.toThrow('Invalid GitHub URL');
  });
});
