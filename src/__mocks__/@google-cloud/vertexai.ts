export class VertexAI {
  constructor(config: any) {}

  getGenerativeModel(config: any) {
    return {
      generateContent: async (params: any) => ({
        response: {
          candidates: [
            {
              content: {
                parts: [
                  {
                    text: JSON.stringify({
                      'Sovereign Architect': { score: 85, evidence: 'Mock evidence' },
                      'Compression Obsessive': { score: 70, evidence: 'Mock evidence' },
                    }),
                  },
                ],
              },
            },
          ],
        },
      }),
    };
  }
}
