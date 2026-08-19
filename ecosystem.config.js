module.exports = {
  apps: [
    {
      // 启动命令为 pm2 start ecosystem.config.js, 由 pm2 以全局安装方式(非项目依赖)驱动
      name: 'ClothingShop-App', // PM2 进程列表显示名
      script: './main.js', // 入口脚本(相对路径)
      instances: 4, // 集群模式起 4 个进程做负载均衡
      exec_mode: 'cluster',
      autorestart: true, // 崩溃自动重启(默认 true)
      restart_delay: 5000, // 重启间隔5s (单位是ms)，避免快速重启风暴
      max_restarts: 20, // 短期超 20 次重启标记为 errored, 停止拉起
      min_uptime: 2000, // 运行不足 2s 视为启动失败
      max_memory_restart: '250M', // 达到内存阈值时自动重启
      watch: false,
      env: {
        NODE_ENV: 'production',
      },
    },
  ],
};
