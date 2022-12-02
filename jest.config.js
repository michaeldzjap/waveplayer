/** @type {import('ts-jest').JestConfigWithTsJest} */
module.exports = {
    testEnvironment: 'jsdom',
    testMatch: ['**/__tests__/**/*.[jt]s'],
    testPathIgnorePatterns: ['<rootDir>/__tests__/stubs/', '<rootDir>/example/', '<rootDir>/node_modules/'],
    transform: {
        '\\.[jt]sx?$': ['ts-jest', { tsconfig: 'tsconfig.test.json' }],
    },
    collectCoverage: true,
};
