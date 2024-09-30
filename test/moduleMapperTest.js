/**
 * Create by CC on 2022/6/12
 * 用于转义别名路径的正则
 */
const { pathsToModuleNameMapper } = require('ts-jest/utils');
const mapper = pathsToModuleNameMapper(
  {
    '@/*': ['src/*'],
    '@T/*': ['test/src/*'],
  },
  {
    // prefix: '<rootDir>/..', // 如果是test的运行使用这个前缀
    // prefix: '<rootDir>/' // 如果是主代码的运行使用这个前缀<rootDir>=src,所以不需要加src
  },
);
console.log(mapper);
