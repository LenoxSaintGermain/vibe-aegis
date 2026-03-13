export interface RepoData {
  url: string;
  owner: string;
  repo: string;
  metadata: {
    stars: number;
    forks: number;
    languages: Record<string, number>;
    createdAt: string;
  };
  commits: CommitInfo[];
  readme: string;
  fileTree: FileTreeNode[];
  lastCommitSHA: string;
}

export interface CommitInfo {
  sha: string;
  message: string;
  author: string;
  date: string;
}

export interface FileTreeNode {
  path: string;
  type: 'file' | 'dir';
  size?: number;
}

export function parseGitHubUrl(url: string): { owner: string; repo: string } | null {
  const match = url.match(/github\.com\/([^\/]+)\/([^\/]+)/);
  if (!match) return null;
  return { owner: match[1], repo: match[2].replace(/\.git$/, '') };
}
