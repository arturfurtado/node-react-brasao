// jest.config.js
module.exports = {
  testEnvironment: 'node',
  preset: 'ts-jest',
  transform: {
    '^.+\\.tsx?$': [
      'ts-jest',
      {
        tsconfig: '<rootDir>/tsconfig.json',
      },
    ],
  },
  moduleNameMapper: {
    '^entities/(.*)$': '<rootDir>/src/entities/$1',
    '^repositories/(.*)$': '<rootDir>/src/repositories/$1',
    '^services/(.*)$': '<rootDir>/src/services/$1',
    '^config/(.*)$': '<rootDir>/src/config/$1',
    '^controllers/(.*)$': '<rootDir>/src/controllers/$1',
    '^exceptions/(.*)$': '<rootDir>/src/exceptions/$1',
    '^middlewares/(.*)$': '<rootDir>/src/middlewares/$1',
    '^routes/(.*)$': '<rootDir>/src/routes/$1',
    '^utils/(.*)$': '<rootDir>/src/utils/$1',
    '^validators/(.*)$': '<rootDir>/src/validators/$1',
  },
  moduleFileExtensions: ['ts', 'tsx', 'js', 'jsx', 'json', 'node'],
  roots: [
    "<rootDir>/src"
  ],
  testMatch: [
    '**/?(*.)+(spec|test).+(ts|tsx|js)'
  ],
  collectCoverage: true,
  coverageDirectory: "coverage",
  collectCoverageFrom: [
    "src/**/*.{ts,tsx}",
    "!src/**/*.d.ts",
    "!src/tests/**/*",
    "!src/migration/**/*",
    "!src/docs/**/*",
    "!src/server.ts",
    "!src/app.ts",
    "!src/config/data-source.ts",
  ],
  clearMocks: true,
};
