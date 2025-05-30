/** @type {import("jest").Config} */
module.exports = {
  preset: 'ts-jest/presets/js-with-ts',
  testEnvironment: 'jsdom',

  collectCoverage: true,
  coverageReporters: ['lcov', 'text'],
  coverageDirectory: 'coverage',

  testMatch: ['**/__tests__/**/*.test.ts'],

  transformIgnorePatterns: ['node_modules/(?!(nanoid)/)'],

  moduleNameMapper: {
    '^@api$': '<rootDir>/src/utils/burger-api',
    '^@utils-types$': '<rootDir>/src/utils/types'
  }
};
