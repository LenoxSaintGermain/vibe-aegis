module.exports = {
  preset: 'ts-jest',
  testEnvironment: 'node',
  roots: ['<rootDir>/src'],
  testMatch: ['**/__tests__/**/*.ts', '**/?(*.)+(spec|test).ts'],
  moduleNameMapper: {
    '^@google-cloud/vertexai$': '<rootDir>/src/__mocks__/@google-cloud/vertexai.ts',
    '^@octokit/rest$': '<rootDir>/src/__mocks__/@octokit/rest.ts',
  },
};
