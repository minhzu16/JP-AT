module.exports = {
  moduleFileExtensions: ['js', 'json', 'ts'],
  rootDir: '..',
  testEnvironment: 'node',
  // *.spec.ts are unit tests (no database); *.e2e-spec.ts boot the app against Postgres.
  testRegex: 'test/.*\\.(e2e-)?spec\\.ts$',
  setupFiles: ['<rootDir>/test/setup-env.js'],
  maxWorkers: 1,
  collectCoverageFrom: ['src/**/*.{ts,tsx}', '!src/**/*.d.ts', '!src/main.ts'],
  coverageDirectory: 'coverage',
  coverageReporters: ['text', 'text-summary', 'lcov'],
  coverageThreshold: {
    global: {
      branches: 15,
      functions: 13,
      lines: 16,
      statements: 16,
    },
  },
  transform: {
    '^.+\\.(t|j)s$': [
      'ts-jest',
      {
        isolatedModules: true,
      },
    ],
  },
  transformIgnorePatterns: ['/node_modules/'],
};
