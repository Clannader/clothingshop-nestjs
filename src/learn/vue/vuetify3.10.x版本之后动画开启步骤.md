# Vuetify 3.10.x 版本之后动画开启步骤

## 1. 动画开启方法

1. 浏览器打开 F12 开发者工具
2. 按 `Ctrl + Shift + P` 打开命令面板
3. 搜索 `Reduced-motion: reduce`，点击关闭该选项（即取消减少动效）

## 2. 验证是否开启成功

打开浏览器控制台（F12），输入：

```js
window.matchMedia('(prefers-reduced-motion: reduce)').matches
```

- 返回 `false` → 动画已启用 ✅
- 返回 `true` → 仍然被检测为减少动效，需重启浏览器再试
