module.exports = {
  roots: ['<rootDir>'],
  transform: {
    '^.+\\.tsx?$': 'ts-jest'
  },
  moduleFileExtensions: ['ts', 'json', 'js'],
  testPathIgnorePatterns: [
    '<rootDir>/node_modules/',
    '<rootDir>/typings/',
    //isolate firebase tests from the main test and coverage run
    //the dependency on docker makes it slow requiring custom timeout
    //and gitlab setup which is not straightforward
    '<rootDir>/packages/store/firebase'
  ],
  collectCoverage: false,
  coverageReporters: ['lcov'],
  collectCoverageFrom: ['{api,packages}/**/*.{js,ts,jsx,tsx}'],
  coveragePathIgnorePatterns: [
    '<rootDir>/.*/jest.config.js',
    '<rootDir>/.*/babel.config.js',
    '<rootDir>/.*/next.config.js',
    '<rootDir>/packages/store/firebase/*',
    '.*/typings/.*'
  ],
  resetMocks: true,
  setupFilesAfterEnv: ['jest-extended', './testEnv.ts'],
  verbose: true
};
