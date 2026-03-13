export class Octokit {
  repos = {
    get: async ({ owner, repo }: any) => ({
      data: {
        stargazers_count: 100,
        forks_count: 50,
        created_at: '2020-01-01',
      },
    }),
    listLanguages: async ({ owner, repo }: any) => ({
      data: { TypeScript: 80, JavaScript: 20 },
    }),
    listCommits: async ({ owner, repo, per_page }: any) => ({
      data: [
        {
          sha: 'abc123',
          commit: {
            message: 'test commit',
            author: { name: 'Test Author', date: '2026-03-12' },
          },
        },
      ],
    }),
    getReadme: async ({ owner, repo }: any) => ({
      data: { content: Buffer.from('# Test README').toString('base64') },
    }),
  };

  git = {
    getTree: async ({ owner, repo, tree_sha, recursive }: any) => ({
      data: {
        tree: [
          { path: 'src/index.ts', type: 'blob', size: 100 },
          { path: 'package.json', type: 'blob', size: 200 },
        ],
      },
    }),
  };
}
