module.exports = {
  apps: [
    {
      // 启动命令为 pm2 start ecosystem.config.js, 由 pm2 以全局安装方式(非项目依赖)驱动
      // 使用这个配置启动pm2,服务器日志正常输出,但是多实例的不行
      // 切换fork或者cluster模式时,需要执行pm2 delete ClothingShop-App,删除pm2的项目才能识别最新的配置
      // exec_mode 变更不能只 pm2 restart，必须先 pm2 delete 再重新 start，否则模式不生效。
      name: 'ClothingShop-App', // PM2 进程列表显示名
      script: './build/main.js', // 入口脚本(相对路径)
      instances: 1, // fork 模式只起 1 个 master 进程,多进程由项目内置 cluster 接管(数量看 config.ini 的 threadNum)
      exec_mode: 'fork', // pm2 用 fork 模式托管 master, worker 由 src/cluster.app.ts fork(前提: config.ini 的 clusterServer=true)
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
