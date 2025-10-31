module.exports = {
  apps: [
    {
      name: "ClothingShop-App",
      script: "./main.js",
      instances: 4,
      exec_mode: "cluster",
      autorestart: true,          // 自动重启（默认 true）
      restart_delay: 5000,        // 重启延迟 ms，避免快速重启风暴
      max_restarts: 20,           // 最大重启次数（短期内）
      min_uptime: 2000,           // 进程运行小于该值视为启动失败
      max_memory_restart: "120M", // 达到内存阈值时自动重启
      watch: false,
      env: {
        NODE_ENV: "production"
      }
    }
  ]
};