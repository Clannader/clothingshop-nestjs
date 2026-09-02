const pkg = require('../package.json');
const fs = require('fs');
const path = require('path');
const archiver = require('archiver');
const version = pkg.version;

const packagePath = path.join(process.cwd(), 'build');

// 生成新的package.json和run.bat
const runBatContentArray = ['npm uninstall all && node main.js', 'pause'];
fs.writeFileSync(
  path.join(packagePath, 'run.bat'),
  runBatContentArray.join('\r\n'),
  'utf8',
);
delete pkg.private;
delete pkg.jest;
delete pkg.devDependencies;
// scripts只保留start
const startScript = pkg.scripts.start;
delete pkg.scripts;
pkg.scripts = {
  start: 'node main.js',
};
fs.writeFileSync(
  path.join(packagePath, 'package.json'),
  JSON.stringify(pkg, null, 2),
  'utf8',
);

const versionPath = path.join(process.cwd(), 'version');
if (!fs.existsSync(versionPath)) {
  fs.mkdirSync(versionPath);
}
const outStream = fs.createWriteStream(
  path.join(versionPath, `clothingshop-build-${version}.zip`),
);
const zlib = archiver('zip', {
  zlib: { level: 9 },
  // zip的DOS时间默认按UTC字段编码,而解压工具按本地时间展示,
  // 东八区打出的包解压后时间会早8小时(旧补丁用moment手动+8h是错误修法);
  // 开启forceLocalTime后改用本地时间字段编码,解压显示的时间与打包时刻一致
  forceLocalTime: true,
});
// 监听要压缩的所有文件数据
outStream.on('close', function () {
  const pointer = zlib.pointer();
  console.log(`总共 ${pointer} 字节`);
  console.log('打包进程关闭');
});

outStream.on('end', function () {
  console.log('打包完成');
});

zlib.on('warning', function (err) {
  if (err.code === 'ENOENT') {
    console.warn(err.message);
  } else {
    throw err;
  }
});

zlib.on('error', function (err) {
  throw err;
});

zlib.pipe(outStream);
// 统一所有条目的时间为打包时刻,不再透传源文件mtime
// (archiver在entryData未设置date时会直接透传文件mtime,
// 源文件mtime异常会原样写进zip,如旧版npm安装的依赖mtime固定为1985-10-26)
const buildTime = new Date();
zlib.directory(packagePath, '', (entryData) => {
  entryData.date = buildTime;
  return entryData;
});
zlib.finalize().then();
