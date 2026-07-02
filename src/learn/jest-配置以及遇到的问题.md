# Jest 配置以及遇到的问题

> 入坑链接，搞了我 2 天也是醉了
>
> 参考链接：[Jest 配置指南](https://www.jianshu.com/p/302db7615cde)

---

## 1. babel.config.js

```js
//babel.config.js
module.exports = {
  presets: [
    '@babel/preset-env',
    '@vue/cli-plugin-babel/preset',
  ],
  plugins: [
    ['import', {
      libraryName: 'vant',
      libraryDirectory: 'es',
      style: name => `${name}/style/less`,
    }, 'vant'],
    ['@babel/plugin-transform-runtime'],
  ],
};
```

---

## 2. jest.config.js

```js
//jest.config.js
module.exports = {
  preset: '@vue/cli-plugin-unit-jest',
  collectCoverage: true,
  coverageDirectory: 'dist/tests',
  moduleFileExtensions: [
    'js',
    'json',
    'vue',
  ],
  transform: {
    '.*\\.(vue)$': 'vue-jest',
    '^.+\\.[t|j]sx?$': 'babel-jest',
  },
  transformIgnorePatterns: ['/src/assets'],
  moduleNameMapper: {
    '\\.(css|less|sass|scss)$': '<rootDir>/__mocks__/styleMock.js',
    '\\.(jpg|jpeg|png|gif|eot|otf|webp|svg|ttf|woff|woff2|mp4|webm|wav|mp3|m4a|aac|oga)$': '<rootDir>/__mocks__/fileMock.js',
    '^@/(.*)$': '<rootDir>/src/$1',
  },
};
```

---

## 3. fileMock.js

```js
//fileMock.js
module.exports = 'test-file-stub';
```

---

## 4. styleMock.js

```js
//styleMock.js
module.exports = {};
```
