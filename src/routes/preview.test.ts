// src/routes/preview.test.ts
import request from 'supertest';
import app from '../index';

describe('POST /api/preview', () => {
  it('should return 3 preview cards', async () => {
    const response = await request(app)
      .post('/api/preview')
      .send({ repoUrl: 'https://github.com/vercel/next.js' })
      .expect(200);

    expect(response.body.cards).toHaveLength(3);
    expect(response.body.cards[0]).toHaveProperty('dimension');
    expect(response.body.cards[0]).toHaveProperty('score');
    expect(response.body.cards[0]).toHaveProperty('evidence');
    expect(response.body.analysisId).toBeDefined();
  });

  it('should return 400 for missing repoUrl', async () => {
    const response = await request(app).post('/api/preview').send({}).expect(400);

    expect(response.body.error).toBe('Invalid repoUrl');
  });

  it('should return 400 for invalid GitHub URL', async () => {
    const response = await request(app)
      .post('/api/preview')
      .send({ repoUrl: 'https://gitlab.com/user/repo' })
      .expect(400);

    expect(response.body.error).toBe('Invalid GitHub URL format');
  });
});
