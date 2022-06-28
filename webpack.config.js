module.exports = function(options) {
  return {
    ...options,
    optimization: {
      ...options.optimization,
      minimize: process.env.NODE_ENV === 'production', // 可以对打包的js进行压缩
    },
  };
};
