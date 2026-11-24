const fs = require('node:fs');
const path = require('node:path');
const { v4 } = require('uuid');
const crypto = require('crypto');
const validator = require('validator');
const projectRoot = path.resolve(__dirname, '..');

/**
 * 确保目录存在：不存在则创建
 * @param {string} dir 目录绝对路径
 * @returns {string} 目录绝对路径（便于继续拼接下级路径）
 */
function ensureDir(dir) {
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir);
    console.log(`[pem/rsa] 目录不存在，已创建：${dir}`);
  }
  return dir;
}

// 1. 项目根目录下没有 pem 目录则创建
const pemDir = ensureDir(path.join(projectRoot, 'pem'));
// 2. pem 目录下没有 rsa 目录则创建
const rsaDir = ensureDir(path.join(pemDir, 'rsa'));
const getRsaDirList = fs.readdirSync(rsaDir);
let latestTime = 0; // 最近创建rsa目录时间
for (const rsaUuid of getRsaDirList) {
  if (validator.isUUID(rsaUuid)) {
    const statDir = fs.statSync(path.join(rsaDir, rsaUuid));
    if (statDir.ctimeMs > latestTime) {
      latestTime = statDir.ctimeMs;
    }
  }
}
const createRsaKey = () => {
  const uuidDir = ensureDir(path.join(rsaDir, v4()));
  const { publicKey, privateKey } = crypto.generateKeyPairSync('rsa', {
    modulusLength: 2048, // 密钥长度
    publicKeyEncoding: {
      type: 'spki',      // 公钥格式标准
      format: 'pem'      // 输出格式
    },
    privateKeyEncoding: {
      type: 'pkcs8',     // 私钥格式标准
      format: 'pem',
      // cipher: 'aes-256-cbc', // 可选：对私钥文件进行加密保护
      // passphrase: 'your-secret-passphrase' // 私钥文件的密码
    }
  });

  // 如果私钥加上了密码,解密的时候也需要加上密码
  // privateDecrypt 同样需要匹配加密时的配置
  // const decrypted = crypto.privateDecrypt({
  //   key: privateKey, // 私钥pem
  //   passphrase: 'your-secret-passphrase', // 如果私钥文件加密了，必须提供此参数
  //   padding: crypto.constants.RSA_PKCS1_OAEP_PADDING,
  //   oaepHash: 'sha256'
  // }, encryptedData);

  fs.writeFileSync(path.join(uuidDir, 'public-rsa.pem'), publicKey);
  fs.writeFileSync(path.join(uuidDir, 'private-rsa.pem'), privateKey);

  console.log('密钥对生成成功!');
}

if (Date.now() - latestTime > 30 * 24 * 60 * 60 * 1000) {
  createRsaKey()
}