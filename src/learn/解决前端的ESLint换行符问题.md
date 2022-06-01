原文:https://zhuanlan.zhihu.com/p/418972384

各开发平台的换行符不一致，win平台会出问题。

一，修改项目配置

有时候使用脚手架创建的项目，比如vue-cli，会默认使用eslint的一些规则，比如airbnb。其中基本会包含这样一条规则：

"linebreak-style":["error", "unix"], 
这个规则的意思是回车换行符使用unix风格的，也就是LF。unix其实主要就是指mac，或者ubuntu这类的。本来团队都用Mac就没啥问题。
但如果你用的是windows。就会有标题中的错误：

(linebreak-style) Expected linebreaks to be 'LF' but found 'CRLF'. (eslint)
但堂堂vue-cli初始化的项目会没考虑到这个问题？当然不会，其实项目中应该还有一个.editorconfig文件，
如果没有，你就自己添加一个，并输入如下：

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

但是发现vue文件没问题了，但是某些文件依然报错

二，修改git配置

不少开发者可能遇到过这个问题：从git上拉取服务端代码，然后只修改了一处地方，准备提交时，用diff软件查看，
却发现整个文件都被修改了。这是git自动转换换行符导致的问题。

原因
不同操作系统使用的换行符是不一样的。Unix/Linux使用的是LF，Mac后期也采用了LF，
但Windows一直使用CRLF【回车(CR, ASCII 13, \r) 换行(LF, ASCII 10, \n)】作为换行符。
而git入库的代码采用的是LF格式，它考虑到了跨平台协作的场景，提供了“换行符自动转换”的功能：
如果在Windows下安装git，在拉取文件时，会自动将LF换行符替换为CRLF；在提交时，又会将CRLF转回LF。
但是这个转换是有问题的：有时提交时，CRLF转回LF可能会不工作，尤其是文件中出现中文字符后有换行符时。

解决方案
1.禁用git的自动换行功能：
在本地路径C:\ Users\ [用户名] \ .gitconfig下修改git配置[core]，如果没有就直接添加上去
[core]
	autocrlf = false
	filemode = false
	safecrlf = true
git bash命令行也可以修改，最终也是修改.gitconfig配置文件：
分别执行：
git config --global core.autocrlf false
git config --global core.filemode false
git config --global core.safecrlf true

保险起见，先保存配置文件，再使用 git bash执行命令

修改完git，重新去git上拉去项目源码
