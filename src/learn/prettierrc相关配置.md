## 配置解析

- "prettier.printWidth": 120 // 超过最大值换行,实际是一行超多多少个字符时会换行
- "prettier.tabWidth": 2 // 缩进字节数
- "prettier.useTabs": false // 缩进不使用tab,使用空格
- "prettier.semi": true // 句尾添加分号
- "prettier.singleQuote": true // 使用单引号替代双引号
- "prettier.proseWrap": "preserve" // 默认值,因为使用了一些折行敏感型的渲染器(如GitHub comment)而按照markdown文本样式进行拆行
- "prettier.arrowParens": "avoid" // (x) => {} 箭头函数参数只有一个时是否要有小括号。avoid:省略括号
- "prettier.bracketSpacing": true // 在对象,数组括号与文字之间加空格"{ foo: bar }"
- "prettier.disableLanguages": ["vue"] // 不格式化vue文件,vue文件的格式化单独设置
- "prettier.endOfLine": "auto" // 结尾是 \r \n \r\n auto
- "prettier.eslintIntegration": false // 不让prettier使用eslint的代码格式进行校验
- "prettier.htmlWhitespaceSensitivity": "ignore" // 
- "prettier.ignorePath": ".prettierignore" // 不使用prettier格式化的文件填写在项目的.prettierignore文件中
- "prettier.jsxBracketSameLine": false // 在jsx中把'>' 是否单独放一行
- "prettier.jsxSingleQuote": false // 在jsx中使用单引号替代双引号
- "prettier.parser": "babylon" // 格式化的解析器,默认是babylon
- "prettier.requireConfig": false // Require a 'prettierconfig' to format prettier
- "prettier.stylelintIntegration": false // 不让prettier使用stylelint的代码格式进行校验
- "prettier.trailingComma": "es5" // 在对象或数组最后一个元素后面是否加逗号(在ES5中加尾逗号)
- "prettier.tslintIntegration": false // 不让prettier使用tslint的代码格式进行校验
- // eslint的'space-before-function-paren'这个规则对应prettier的方法前面空格处理,eslint需要设置关闭才可以校验通过
