# 解决前端的 ESLint 换行符问题

> 原文链接：https://zhuanlan.zhihu.com/p/418972384

各开发平台的换行符不一致，win 平台会出问题。

---

## 1. 修改项目配置

有时候使用脚手架创建的项目，比如 vue-cli，会默认使用 eslint 的一些规则，比如 airbnb。其中基本会包含这样一条规则：

```json
"linebreak-style": ["error", "unix"],
```

这个规则的意思是回车换行符使用 unix 风格的，也就是 LF。unix 其实主要就是指 mac，或者 ubuntu 这类的。本来团队都用 Mac 就没啥问题。

但如果你用的是 windows，就会有标题中的错误：

```
(linebreak-style) Expected linebreaks to be 'LF' but found 'CRLF'. (eslint)
```

但堂堂 vue-cli 初始化的项目会没考虑到这个问题？当然不会，其实项目中应该还有一个 `.editorconfig` 文件，如果没有，你就自己添加一个，并输入如下：

```ini
[*.{js,jsx,ts,tsx,vue}]
# 缩进使用空格
indent_style = space
# 缩进2个字符
indent_size = 2
# 行结尾使用 lf !!!!
end_of_line = lf
# 删除行尾空格
trim_trailing_whitespace = true
# 文件结尾添加一个空行
insert_final_newline = true
# 行最大长度
max_line_length = 100
```

但是发现 vue 文件没问题了，但是某些文件依然报错。

---

## 2. 修改 git 配置

不少开发者可能遇到过这个问题：从 git 上拉取服务端代码，然后只修改了一处地方，准备提交时，用 diff 软件查看，却发现整个文件都被修改了。这是 git 自动转换换行符导致的问题。

### 2.1 原因

不同操作系统使用的换行符是不一样的。Unix/Linux 使用的是 LF，Mac 后期也采用了 LF，但 Windows 一直使用 CRLF【回车(CR, ASCII 13, \r) 换行(LF, ASCII 10, \n)】作为换行符。

而 git 入库的代码采用的是 LF 格式，它考虑到了跨平台协作的场景，提供了"换行符自动转换"的功能：如果在 Windows 下安装 git，在拉取文件时，会自动将 LF 换行符替换为 CRLF；在提交时，又会将 CRLF 转回 LF。

但是这个转换是有问题的：有时提交时，CRLF 转回 LF 可能会不工作，尤其是文件中出现中文字符后有换行符时。

### 2.2 解决方案

**禁用 git 的自动换行功能：**

在本地路径 `C:\Users\[用户名]\.gitconfig` 下修改 git 配置 `[core]`，如果没有就直接添加上去：

```ini
[core]
	autocrlf = false
	filemode = false
	safecrlf = true
```

git bash 命令行也可以修改，最终也是修改 `.gitconfig` 配置文件。分别执行：

```bash
git config --global core.autocrlf false
git config --global core.filemode false
git config --global core.safecrlf true
```

> 保险起见，先保存配置文件，再使用 git bash 执行命令。

修改完 git，重新去 git 上拉取项目源码。
