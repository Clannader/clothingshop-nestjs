const path = require('path');
const CopyWebpackPlugin = require('copy-webpack-plugin');

module.exports = function (options) {
  return {
    ...options,
    output: {
      // ...options.output,
      path: path.join(process.cwd(), 'build'),
      // filename: 'main.[chunkhash].js'
      filename: 'main.js',
    },
    optimization: {
      ...options.optimization,
      // nodeEnv: true,
      // minimize: false,
      // minimize: process.env.NODE_ENV === 'production', // 可以对打包的js进行压缩,这个也是有效的
    },
    plugins: [
      ...options.plugins,
      new CopyWebpackPlugin({
        patterns: [
          { from: 'public', to: 'public' },
          { from: 'views', to: 'views' },
        ],
      }),
    ],
  };
};
