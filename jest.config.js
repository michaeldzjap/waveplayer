/** @type {import('ts-jest').JestConfigWithTsJest} */
module.exports = {
    testEnvironment: 'jsdom',
    testMatch: ['**/__tests__/**/*.[jt]s'],
    transform: {
        '\\.[jt]sx?$': ['ts-jest', { tsconfig: 'tsconfig.test.json' }],
    },
    collectCoverage: true,
};
