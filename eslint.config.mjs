import path from 'node:path';
import { fileURLToPath } from 'node:url';
import eslintPlugin from '@typescript-eslint/eslint-plugin';
import eslintParser from '@typescript-eslint/parser';
import tsEslint from 'typescript-eslint';

import eslintPluginPrettierRecommended from 'eslint-plugin-prettier/recommended';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

export default [
  /** ts推荐配置 */
  ...tsEslint.configs.recommended,
  /**
   * 配置全局变量
   */
  {
    languageOptions: {
      parser: eslintParser,
      parserOptions: {
        project: 'tsconfig.json',
        tsconfigRootDir: __dirname,
        sourceType: 'module',
      },
      globals: {
        node: true,
        jest: true,
      },
    },
    plugins: {
      eslintPlugin,
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
    rules: {
      '@typescript-eslint/interface-name-prefix': 'off',
      '@typescript-eslint/explicit-function-return-type': 'off',
      '@typescript-eslint/explicit-module-boundary-types': 'off',
      '@typescript-eslint/no-explicit-any': 'off',
      '@typescript-eslint/ban-types': 'off',
      '@typescript-eslint/ban-ts-comment': 'off',
    },
  },
  // 忽略文件
  {
    ignores: ['node_modules', 'dist', 'build', 'public'],
  },
  /**
   * prettier 配置
   * 会合并根目录下的.prettier.config.js 文件
   * @see https://prettier.io/docs/en/options
   */
  eslintPluginPrettierRecommended,
];
