/* eslint-disable @typescript-eslint/no-var-requires */
module.exports = {
    preset: 'ts-jest',
    testEnvironment: 'node',
    moduleNameMapper: {
        '^@platform/(.*)$': '<rootDir>/../../packages/@platform/$1/src'
    },
};
