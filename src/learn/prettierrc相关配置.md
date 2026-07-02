# Prettier 相关配置说明

## 配置解析

---

## 1. 格式化基础配置

| 配置项 | 默认值 | 说明 |
|--------|--------|------|
| `prettier.printWidth` | `120` | 超过最大值换行，实际是一行超多少个字符时会换行 |
| `prettier.tabWidth` | `2` | 缩进字节数 |
| `prettier.useTabs` | `false` | 缩进不使用 tab，使用空格 |
| `prettier.semi` | `true` | 句尾添加分号 |
| `prettier.singleQuote` | `true` | 使用单引号替代双引号 |
| `prettier.trailingComma` | `"es5"` | 在对象或数组最后一个元素后面是否加逗号（在 ES5 中加尾逗号） |
| `prettier.bracketSpacing` | `true` | 在对象、数组括号与文字之间加空格，如 `"{ foo: bar }"` |
| `prettier.arrowParens` | `"avoid"` | `(x) => {}` 箭头函数参数只有一个时是否要有小括号。`avoid`：省略括号 |
| `prettier.proseWrap` | `"preserve"` | 默认值，因为使用了一些折行敏感型的渲染器（如 GitHub comment）而按照 markdown 文本样式进行拆行 |
| `prettier.endOfLine` | `"auto"` | 结尾是 `\r` `\n` `\r\n` `auto` |
| `prettier.parser` | `"babylon"` | 格式化的解析器，默认是 babylon |

---

## 2. JSX 相关配置

| 配置项 | 默认值 | 说明 |
|--------|--------|------|
| `prettier.jsxBracketSameLine` | `false` | 在 JSX 中把 `>` 是否单独放一行 |
| `prettier.jsxSingleQuote` | `false` | 在 JSX 中使用单引号替代双引号 |

---

## 3. 编辑器集成配置

| 配置项 | 默认值 | 说明 |
|--------|--------|------|
| `prettier.eslintIntegration` | `false` | 不让 prettier 使用 eslint 的代码格式进行校验 |
| `prettier.stylelintIntegration` | `false` | 不让 prettier 使用 stylelint 的代码格式进行校验 |
| `prettier.tslintIntegration` | `false` | 不让 prettier 使用 tslint 的代码格式进行校验 |

---

## 4. 文件控制配置

| 配置项 | 默认值 | 说明 |
|--------|--------|------|
| `prettier.disableLanguages` | `["vue"]` | 不格式化 vue 文件，vue 文件的格式化单独设置 |
| `prettier.ignorePath` | `".prettierignore"` | 不使用 prettier 格式化的文件填写在项目的 `.prettierignore` 文件中 |
| `prettier.requireConfig` | `false` | Require a 'prettierconfig' to format prettier |
| `prettier.htmlWhitespaceSensitivity` | `"ignore"` | HTML 空白敏感度处理 |

---

## 5. 补充说明

> **ESLint 与 Prettier 冲突提示：**
>
> ESLint 的 `space-before-function-paren` 规则对应 Prettier 的方法前面空格处理，ESLint 需要设置关闭才可以校验通过。

---

## 6. 完整配置示例

```json
{
  "prettier.printWidth": 120,
  "prettier.tabWidth": 2,
  "prettier.useTabs": false,
  "prettier.semi": true,
  "prettier.singleQuote": true,
  "prettier.trailingComma": "es5",
  "prettier.bracketSpacing": true,
  "prettier.arrowParens": "avoid",
  "prettier.proseWrap": "preserve",
  "prettier.endOfLine": "auto",
  "prettier.parser": "babylon",
  "prettier.jsxBracketSameLine": false,
  "prettier.jsxSingleQuote": false,
  "prettier.eslintIntegration": false,
  "prettier.stylelintIntegration": false,
  "prettier.tslintIntegration": false,
  "prettier.disableLanguages": ["vue"],
  "prettier.ignorePath": ".prettierignore",
  "prettier.requireConfig": false,
  "prettier.htmlWhitespaceSensitivity": "ignore"
}
```
