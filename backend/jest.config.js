// jest.config.js
/** @type {import('ts-jest').JestConfigWithTsJest} */
module.exports = {
  preset: 'ts-jest',               
  testEnvironment: 'node',
  transform: {
    '^.+\\.(ts|tsx)$': 'ts-jest'    // arquivos .ts/.tsx via ts-jest
  },
  testPathIgnorePatterns: [
    '/dist/',                       // ignora todo o dist/
  ],
};
