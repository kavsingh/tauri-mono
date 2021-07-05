module.exports = {
  moduleNameMapper: { '^~/(.*)': '<rootDir>/src/$1' },
  testEnvironment: 'jsdom',
  setupFilesAfterEnv: ['./jest.setup.after-env.ts'],
};
