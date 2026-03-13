import { parseGitHubUrl } from './github';

describe('GitHub URL Parser', () => {
  it('should parse valid GitHub URLs', () => {
    expect(parseGitHubUrl('https://github.com/vercel/next.js')).toEqual({
      owner: 'vercel',
      repo: 'next.js',
    });

    expect(parseGitHubUrl('github.com/anthropics/anthropic-sdk-python')).toEqual({
      owner: 'anthropics',
      repo: 'anthropic-sdk-python',
    });
  });

  it('should handle .git suffix', () => {
    expect(parseGitHubUrl('https://github.com/user/repo.git')).toEqual({
      owner: 'user',
      repo: 'repo',
    });
  });

  it('should return null for invalid URLs', () => {
    expect(parseGitHubUrl('https://gitlab.com/user/repo')).toBeNull();
    expect(parseGitHubUrl('not a url')).toBeNull();
  });
});
