module.exports = {
  preset: 'jest-puppeteer',
  testMatch: ['**/*.test.js'],
  setupFilesAfterEnv: ['<rootDir>/setup.js'],
  testTimeout: 60000,
  verbose: true
}