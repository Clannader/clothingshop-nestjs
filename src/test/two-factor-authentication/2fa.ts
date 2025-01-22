/**
 * Create by oliver.wu 2025/1/17
 */
import speakeasy from 'speakeasy';
import * as crypto from 'node:crypto';
import * as fs from 'node:fs';
import qrcode from 'qrcode';
import * as path from 'node:path';

const secret = speakeasy.generateSecret({
  length: 32,
  name: 'Oliver',
});
console.log(secret);

const token = speakeasy.totp({
  secret: secret.base32,
  encoding: 'base32',
});
console.log(token);

qrcode.toDataURL(secret.otpauth_url).then((dataUrl) => {
  const base64Data = dataUrl.replace(/^data:image\/\w+;base64,/, '');
  const buffer = Buffer.from(base64Data, 'base64');
  const filePath = path.join(process.cwd(), '2fa.png');
  // fs.writeFileSync(filePath, buffer);
});

const verified = speakeasy.totp.verify({
  secret: secret.base32,
  encoding: 'base32',
  token: token,
});
console.log(verified);

// 恢复码
const generateRecoveryCodes = function () {
  const codes = [];
  for (let i = 0; i < 10; i++) {
    const code =
      crypto.randomBytes(3).toString('hex') +
      '-' +
      crypto.randomBytes(3).toString('hex');
    codes.push(code);
  }
  return codes;
};
console.log(generateRecoveryCodes());
