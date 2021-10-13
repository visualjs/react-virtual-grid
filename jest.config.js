/** @type {import('ts-jest/dist/types').InitialOptionsTsJest} */
module.exports = {
  preset: 'ts-jest',
  moduleFileExtensions: [
    "js",
    "jsx",
    "ts",
    "tsx"
  ],
  transform: {
    "^.+\\.tsx?$": "esbuild-jest"
  }
};
