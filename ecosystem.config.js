const path = require('path');
const pm2Path = path.join(process.cwd(), 'logs', 'pm2')
module.exports = {
  apps: [
    {
      // 启动命令为 pm2 start ecosystem.config.js, 由 pm2 以全局安装方式(非项目依赖)驱动
      name: 'ClothingShop-App', // PM2 进程列表显示名
      script: './build/main.js', // 入口脚本(相对路径)
      instances: 4,
      exec_mode: 'cluster',
      instance_var: 'INSTANCE_ID', // cluster模式下关键配置
      autorestart: true, // 崩溃自动重启(默认 true)
      restart_delay: 5000, // 重启间隔5s (单位是ms)，避免快速重启风暴
      max_restarts: 20, // 短期超 20 次重启标记为 errored, 停止拉起
      min_uptime: 2000, // 运行不足 2s 视为启动失败
      max_memory_restart: '250M', // 达到内存阈值时自动重启
      watch: false,
      // ---- pm2 日志路径: 用 __dirname 锚定到本文件所在目录(相对路径会按执行 pm2 命令时的 cwd 解析,易漂移) ----
      out_file: path.join(pm2Path, 'out', 'out.log'), // 标准输出日志(默认在 %USERPROFILE%\.pm2\logs)
      error_file: path.join(pm2Path, 'error', 'error.log'), // 错误输出日志
      pid_file: path.join(pm2Path, 'pid', 'app.pid'), // 进程 pid 文件(默认在 %USERPROFILE%\.pm2\pids)
      // log_date_format: 'YYYY-MM-DD HH:mm:ss.SSS', // 每行 pm2 日志前置时间戳(仅 pm2 转发日志,log4js 时间戳不受影响)
      env: {
        NODE_ENV: 'production',
      },
    },
  ],
};
