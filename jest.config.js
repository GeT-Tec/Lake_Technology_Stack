const nextJest = require('next/jest');

const createJestConfig = nextJest({
    // Provide the path to your Next.js app to load next.config.js and .env files
    dir: './',
});

/** @type {import('jest').Config} */
const customJestConfig = {
    setupFilesAfterEnv: ['<rootDir>/tests/setup.ts'],
    testEnvironment: 'jsdom',
    moduleNameMapper: {
        '^@/(.*)$': '<rootDir>/$1',
    },
    testPathIgnorePatterns: [
        '<rootDir>/node_modules/',
        '<rootDir>/.next/',
    ],
    collectCoverageFrom: [
        'app/**/*.{js,jsx,ts,tsx}',
        'components/**/*.{js,jsx,ts,tsx}',
        'lib/**/*.{js,jsx,ts,tsx}',
        'services/**/*.{js,jsx,ts,tsx}',
        '!**/*.d.ts',
        '!**/node_modules/**',
    ],
    coverageThreshold: {
        global: {
            branches: 50,
            functions: 50,
            lines: 50,
            statements: 50,
        },
    },
    testMatch: [
        '<rootDir>/tests/**/*.test.{js,jsx,ts,tsx}',
        '<rootDir>/**/__tests__/**/*.{js,jsx,ts,tsx}',
    ],
};

module.exports = createJestConfig(customJestConfig);
