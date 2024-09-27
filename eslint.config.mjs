import path from 'node:path';
import { fileURLToPath } from 'node:url';
import eslintPlugin from '@typescript-eslint/eslint-plugin';
import eslintParser from '@typescript-eslint/parser';

// import tsRecommended from '@typescript-eslint/recommended'
// import prettier from 'prettier/recommended'

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

export default [
  // tsRecommended,
  // prettier,
  {
    languageOptions: {
      parser: eslintParser,
      parserOptions: {
        project: 'tsconfig.json',
        tsconfigRootDir : __dirname,
        sourceType: 'module',
      },
      globals: {
        node: true,
        jest: true,
      }
    },
    plugins: {
      eslintPlugin
    },
    // extends: [
    //   'plugin:@typescript-eslint/recommended',
    //   'plugin:prettier/recommended',
    // ],
    // root: true,
    // env: {
    //   node: true,
    //   jest: true,
    // },
    files: [
      'src/**/*.ts',
      'test/**/*.ts',
    ],
    // ignorePatterns: ['eslint.config.mjs'],
    rules: {
      '@typescript-eslint/interface-name-prefix': 'off',
      '@typescript-eslint/explicit-function-return-type': 'off',
      '@typescript-eslint/explicit-module-boundary-types': 'off',
      '@typescript-eslint/no-explicit-any': 'off',
      '@typescript-eslint/ban-types': 'off',
      '@typescript-eslint/ban-ts-comment': 'off',
    },
  }
];
