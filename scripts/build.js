const pkg = require('../package.json');
const fs = require('fs');
const path = require('path');
const archiver = require('archiver');
const version = pkg.version;

const packagePath = path.join(process.cwd(), 'build');

// 生成新的package.json和run.bat
const runBatContentArray = [
  'node main.js',
  'pause'
]
fs.writeFileSync(path.join(packagePath, 'run.bat'), runBatContentArray.join('\r\n'), 'utf8');
delete pkg.jest
delete pkg.devDependencies
fs.writeFileSync(path.join(packagePath, 'package.json'), JSON.stringify(pkg, null, 2), 'utf8');

const versionPath = path.join(process.cwd(), 'version');
if (!fs.existsSync(versionPath)) {
  fs.mkdirSync(versionPath);
}
const outStream = fs.createWriteStream(
  path.join(versionPath, `clothingshop-build-${version}.zip`),
);
const zlib = archiver('zip', {
  zlib: { level: 9 },
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
zlib.directory(packagePath, false);
zlib.finalize().then();
