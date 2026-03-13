import { generateCacheKey } from './cache';

describe('Cache Service', () => {
  it('should generate deterministic cache keys', () => {
    const key1 = generateCacheKey('https://github.com/vercel/next.js', 'abc123');
    const key2 = generateCacheKey('https://github.com/vercel/next.js', 'abc123');
    const key3 = generateCacheKey('https://github.com/vercel/next.js', 'def456');

    expect(key1).toBe(key2);
    expect(key1).not.toBe(key3);
    expect(key1.length).toBe(64); // SHA-256 hex length
  });
});
