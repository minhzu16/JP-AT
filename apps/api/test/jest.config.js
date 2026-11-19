module.exports = {
  moduleFileExtensions: ['js', 'json', 'ts'],
  rootDir: '.',
  testEnvironment: 'node',
  // *.spec.ts are unit tests (no database); *.e2e-spec.ts boot the app against Postgres.
  testRegex: '\\.(e2e-)?spec\\.ts$',
  setupFiles: ['<rootDir>/setup-env.js'],
  maxWorkers: 1,
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
