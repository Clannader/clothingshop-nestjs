# GitHub 工作流程

---

## 1. 查看项目 GitHub 的用户名和邮箱

```bash
git config user.name
git config user.email
```

---

## 2. 修改项目 GitHub 的用户名和邮箱

```bash
git config user.name "xxx"
git config user.email "xxx"
```

---

## 3. gitconfig 全局配置

```ini
[user]
    name = xxx
    email = xxx
[http]
    proxy = http://ip:port
```

---

## 4. 发布版本授权

在 npm 注册账号，cmd 进入项目的控制台输入 `npm adduser`，需要修改 npm 的指向地址为默认的 `https://registry.npmjs.org/`

如果之前设置过镜像需要删除，然后点击链接进行登录即可。

---

## 5. npmrc 配置

```ini
proxy=http://ip:port  # 设置代理
```

---

## 6. npm 设置镜像

> 地址可能不可用，需要重新网上找过才得。

```ini
registry=http://registry.npm.taobao.org/  https://registry.npmmirror.com/
sass_binary_site=https://registry.npmmirror.com/node-sass/
electron_mirror=https://registry.npmmirror.com/electron
```

---

## 7. Fork 他人项目时分支和 Tags 的问题

目前 fork 他人的项目时，没有把分支和 tags fork 过来，以前 github 的机制是会 fork 过来的，现在的机制不会再 fork 了。

如果需要 fork 分支过来，可以建一条和他人项目的相同名字的分支，然后通过自己的 pr 合并过来，如果有冲突可以执行：

```bash
git pull xxx/xxx.git branch号
```

> 发现可以通过 github 的命令合并他人项目的分支到自己的项目里面。

---

## 8. 项目配置相关

- 8. 项目中新增 `.npmrc` 可以覆盖全局的 `.npmrc` 配置
- 9. 项目中新增 `.github` 目录下的 `workflows` 可以指定 PR 和 push 分支时自动执行检测脚本
- 10. 项目中的 `.github` 还可以设置默认的 PR 检查列表
- 11. 项目中新增 `renovate.json` 可以让 github 的机器人自动更新最新依赖包版本
- 12. electron 项目的 build，第一次的时候需要使用管理员权限执行 `npm run build` 才能成功，后面的 build 可以使用 IDEA 执行

---

## 9. 远程获取别的项目分支

```bash
# 添加远程仓库
git remote add [仓库分类名:upstream] [原仓库URL]

# 获取目标仓库分支
git fetch [仓库分类名:upstream] [分支名]
```
