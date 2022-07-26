// import { join } from 'path'

module.exports = function(options) {
  return {
    ...options,
    // output: {
    //   path: join(process.cwd(), 'build'),
    //   filename: join(process.cwd(), 'main.[chunkhash].js')
    // },
    optimization: {
      ...options.optimization,
      minimize: process.env.NODE_ENV === 'production', // 可以对打包的js进行压缩
    },
  };
};
