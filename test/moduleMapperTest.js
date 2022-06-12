/**
 * Create by CC on 2022/6/12
 * 用于转义别名路径的正则
 */
const { pathsToModuleNameMapper } = require('ts-jest/utils');
console.log(pathsToModuleNameMapper({
  "@/*":["src/*"],
  "@T/*":["test/src/*"]
}, {
  // prefix: '这里可以加入前缀'
}))
