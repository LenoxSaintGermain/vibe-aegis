import { Octokit } from '@octokit/rest';
import { RepoData, parseGitHubUrl, CommitInfo, FileTreeNode } from '../types/github';

const octokit = new Octokit();

export async function fetchRepoData(
  repoUrl: string,
  mode: 'preview' | 'full'
): Promise<RepoData> {
  const parsed = parseGitHubUrl(repoUrl);
  if (!parsed) {
    throw new Error('Invalid GitHub URL');
  }

  const { owner, repo } = parsed;

  // Fetch repo metadata
  const repoResponse = await octokit.repos.get({ owner, repo });
  const metadata = {
    stars: repoResponse.data.stargazers_count,
    forks: repoResponse.data.forks_count,
    languages: await fetchLanguages(owner, repo),
    createdAt: repoResponse.data.created_at,
  };

  // Fetch commits (50 for preview, 200 for full)
  const commitCount = mode === 'preview' ? 50 : 200;
  const commits = await fetchCommits(owner, repo, commitCount);

  // Fetch README
  const readme = await fetchReadme(owner, repo);

  // Fetch file tree (depth 2 for preview, full for full mode)
  const fileTree = await fetchFileTree(owner, repo, mode === 'preview' ? 2 : 10);

  return {
    url: repoUrl,
    owner,
    repo,
    metadata,
    commits,
    readme,
    fileTree,
    lastCommitSHA: commits[0]?.sha || 'unknown',
  };
}

async function fetchLanguages(owner: string, repo: string): Promise<Record<string, number>> {
  try {
    const response = await octokit.repos.listLanguages({ owner, repo });
    return response.data;
  } catch (error) {
    return {};
  }
}

async function fetchCommits(owner: string, repo: string, count: number): Promise<CommitInfo[]> {
  try {
    const response = await octokit.repos.listCommits({
      owner,
      repo,
      per_page: Math.min(count, 100),
    });

    return response.data.map((commit) => ({
      sha: commit.sha,
      message: commit.commit.message,
      author: commit.commit.author?.name || 'Unknown',
      date: commit.commit.author?.date || '',
    }));
  } catch (error) {
    return [];
  }
}

async function fetchReadme(owner: string, repo: string): Promise<string> {
  try {
    const response = await octokit.repos.getReadme({ owner, repo });
    const content = Buffer.from(response.data.content, 'base64').toString('utf-8');
    return content;
  } catch (error) {
    return '';
  }
}

async function fetchFileTree(
  owner: string,
  repo: string,
  maxDepth: number
): Promise<FileTreeNode[]> {
  try {
    const response = await octokit.git.getTree({
      owner,
      repo,
      tree_sha: 'HEAD',
      recursive: maxDepth > 2 ? 'true' : undefined,
    });

    return response.data.tree
      .filter((item) => {
        const depth = item.path?.split('/').length || 0;
        return depth <= maxDepth;
      })
      .map((item) => ({
        path: item.path || '',
        type: item.type === 'tree' ? 'dir' : 'file',
        size: item.size,
      }));
  } catch (error) {
    return [];
  }
}
