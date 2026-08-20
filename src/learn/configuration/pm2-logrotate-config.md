# pm2-logrotate 配置说明

> 来源：执行 `pm2 conf pm2-logrotate` 实测回显  
> 模块版本：v3.0.0，安装位置：`~/.pm2/modules/pm2-logrotate`（pm2 全局模块）  
> 持久化文件：`~/.pm2/module_conf.json`

## 配置项一览（共七项）

| # | 配置项 | 当前值 | 含义说明 |
|---|--------|--------|----------|
| 1 | **dateFormat** | `YYYY-MM-DD` | 轮转文件名的日期后缀格式（轮转后文件形如 `out__2026-08-20.log`） |
| 2 | **rotateInterval** | `0 0 * * *` | 轮转定时器（cron 格式，每天 00:00 触发一次轮转） |
| 3 | workerInterval | `30` | 巡检间隔（秒），每 30 秒检查一次日志文件大小 |
| 4 | max_size | `10M` | 大小兜底：单文件超过 10M 立即触发轮转 |
| 5 | retain | `30` | 历史日志保留份数，超过 30 份自动删除最旧的 |
| 6 | compress | `false` | 旧日志是否 gzip 压缩（Windows 环境建议保持 false） |
| 7 | rotateModule | `true` | 模块自身日志（`~/.pm2/logs/pm2-logrotate-out.log`）也参与轮转 |

## 轮转触发条件

满足任一即触发：

1. **定时触发**：`rotateInterval` 到点（当前每天 00:00）
2. **大小触发**：日志超过 `max_size`（当前 10M），由 `workerInterval` 每 30 秒巡检发现

## 常用操作命令

```powershell
# 查看当前配置
pm2 conf pm2-logrotate

# 修改单项配置（改完模块自动重启，即时生效）
pm2 set pm2-logrotate:dateFormat YYYY-MM-DD_HH-mm-ss
pm2 set pm2-logrotate:rotateInterval 0 0 * * *
pm2 set pm2-logrotate:max_size 50M
pm2 set pm2-logrotate:retain 15
```

## 注意事项

- pm2-logrotate 随 pm2 daemon 自动启动（模块层自启），但本机未配置 OS 级开机自启
- 机器重启后需手动 `pm2 resurrect` 恢复（`dump.pm2` 已存在，此前执行过 `pm2 save`）
- 修改配置不需要重启应用，只影响模块进程本身
