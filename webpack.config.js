// import { join } from 'path'

module.exports = function(options) {
  return {
    ...options,
    output: {
      path: 'D:\\eclipseWorkspace\\clothingshop-nestjs\\build' // 暂时使用绝对路径,这个webpack打包还是有问题,估计缺少了插件,要不然不会写了无效的
      // ...options.output,
      // path: join(process.cwd(), 'build'),
      // filename: join(process.cwd(), 'main.[chunkhash].js')
    },
    optimization: {
      ...options.optimization,
      // nodeEnv: true,
      minimize: process.env.NODE_ENV === 'production', // 可以对打包的js进行压缩
    },
  };
};
