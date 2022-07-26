// import { join } from 'path'

module.exports = function(options) {
  return {
    ...options,
    output: {
      ...options.output,
      path: 'D:\\eclipseWorkspace\\clothingshop-nestjs\\build',
    //   filename: join(process.cwd(), 'main.[chunkhash].js')
    },
    optimization: {
      ...options.optimization,
      minimize: process.env.NODE_ENV === 'production', // 可以对打包的js进行压缩
    },
  };
};
