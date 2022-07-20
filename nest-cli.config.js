/**
 * Create by CC on 2022/7/20
 */
module.exports = {
  collection: '@nestjs/schematics',
  sourceRoot: 'src',
  compilerOptions: {
    plugins: [{
      name: '@nestjs/swagger',
      options: {
        introspectComments: true
      }
    }],
    webpack: process.env.NODE_ENV === 'production',
    webpackConfigPath: 'webpack.config.js',
    tsConfigPath: 'tsconfig.build.json'
  }
}
