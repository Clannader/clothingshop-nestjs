```
1.查看项目github的用户名和邮箱
git config user.name
git config user.email
```

```
2.修改项目github的用户名和邮箱
git config user.name "xxx"
git config user.email "xxx"
```

```
3.gitconfig全局配置
[user]
    name = xxx
    email = xxx
[http]
    proxy = http://ip:port
```

```
4.发布版本授权
在npm注册账号,cmd进入项目的控制台输入npm adduser,需要修改npm的指向地址为默认的https://registry.npmjs.org/
如果之前设置过镜像需要删除.然后点击链接进行登录即可
```

```
5.npmrc配置
proxy=http://ip:port  设置代理
```

```
6.npm设置镜像,地址可能不可用,需要重新网上找过才得
registry=http://registry.npm.taobao.org/  https://registry.npmmirror.com/
sass_binary_site=https://registry.npmmirror.com/node-sass/
electron_mirror=https://registry.npmmirror.com/electron
```

```
7.目前fork他人的项目时,没有把分支和tags fork过来,以前github的机制是会fork过来的,现在的机制不会再fork了
如果需要fork分支过来,可以建一条和他人项目的相同名字的分支,然后通过自己的pr合并过来,如果有冲突可以执行
git pull xxx/xxx.git branch号 发现可以通过github的命令合并他人项目的分支到自己的项目里面
```

```
8.项目中新增.npmrc可以覆盖全局的.npmrc配置
9.项目中新增.github目录下的workflows可以指定PR和push分支时自动执行检测脚本
10.项目中的.github还可以设置默认的PR检查列表
11.项目中新增renovate.json可以让github的机器人自动更新最新依赖包版本
12.electron项目的build,第一次的时候需要使用管理员权限执行npm run build才能成功,后面的build可以使用IDEA执行
```

```
13.远程获取别的项目分支:git remote add [仓库分类名:upstream] [原仓库URL]
git fetch [仓库分类名:upstream] [分支名] 获取目标仓库分支
```
