module.exports = {
  rootDir: '.',
  testRegex: '.*\\.(spec|e2e-spec)\\.ts$',
  extensionsToTreatAsEsm: ['.ts'],
  transform: {
    '^.+\\.tsx?$': ['ts-jest', {
      useESM: true,
      tsconfig: {
        module: 'ESNext',
        moduleResolution: 'Node',
        emitDecoratorMetadata: true,
        experimentalDecorators: true,
      },
    }],
  },
  moduleNameMapper: { '^(\\.{1,2}/.*)\\.js$': '$1' },
  testEnvironment: 'node',
  collectCoverageFrom: ['src/**/*.(t|j)s'],
  coverageDirectory: './coverage',
}
