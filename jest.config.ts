export default {
  transform: { '^.+\\.tsx?$': 'ts-jest' },
  moduleNameMapper: { '^~/(.*)': '<rootDir>/src/$1' },
  moduleFileExtensions: ['ts', 'tsx', 'js', 'jsx'],
  testEnvironment: 'jsdom',
  setupFilesAfterEnv: ['<rootDir>/jest.setup-after-env.ts'],
  globals: {
    'ts-jest': { babelConfig: { plugins: ['@vanilla-extract/babel-plugin'] } },
  },
};
