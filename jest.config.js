const nextJest = require('next/jest')

const createJestConfig = nextJest({
    // Provide the path to your Next.js app to load next.config.js and .env files in your test environment
    dir: './',
})

const customJestConfig = {
    setupFilesAfterEnv: ['<rootDir>/jest.setup.js'],
    testEnvironment: 'jest-environment-jsdom',
    moduleNameMapper: {
        // Handle module aliases (if you're using them in your project)
        '^@/components/(.*)$': '<rootDir>/src/app/components/$1',
        '^@/app/(.*)$': '<rootDir>/src/app/$1',
        '^@/(.*)$': '<rootDir>/src/$1',
    },
    rootDir: './',
    modulePaths: ['<rootDir>/src/'],
}

module.exports = createJestConfig(customJestConfig)