import { Utils } from './utils';

describe('Utils', () => {
  it('32位系统路径转义', () => {
    expect(Utils.escapePath('/src/config\\configService\\index')).toBe(
      '\\src\\config\\configService\\index',
    );
  });

  // it('64位系统路径转义', () => {
  //   expect(Utils.escapePath('/src/config\configService\index')).toBe('/src/config/configService/index');
  // });

  it('特殊字符转义', () => {
    expect(Utils.escapeString('src\\')).toBe('src\\\\');
    // 这里的\[相当于[,而不是\和[
    expect(Utils.escapeString('src[config]$ini')).toBe('src\\[config\\]\\$ini');
    expect(Utils.escapeString('src.')).toBe('src\\.');
    expect(Utils.escapeString('src*')).toBe('src\\*');
    expect(Utils.escapeString('src+')).toBe('src\\+');
    expect(Utils.escapeString('src?')).toBe('src\\?');
    expect(Utils.escapeString('src^')).toBe('src\\^');
    expect(Utils.escapeString('src..**++')).toBe('src\\.\\.\\*\\*\\+\\+');
    expect(Utils.escapeString('src[]')).toBe('src\\[\\]');
    expect(Utils.escapeString('src//')).toBe('src\\/\\/');
    expect(Utils.escapeString('src/[config]/$ini')).toBe(
      'src\\/\\[config\\]\\/\\$ini',
    );
    expect(Utils.escapeString('src=!${}()|')).toBe(
      'src\\=\\!\\$\\{\\}\\(\\)\\|',
    );
  });

  it('md5加密 "a"', () => {
    expect(Utils.md5('a')).toBe('0cc175b9c0f1b6a831c399e269772661');
  });

  it('sha1加密 "a"', () => {
    expect(Utils.sha1('a')).toBe('86f7e437faa5a7fce15d1ddcb9eaeaea377667b8');
  });

  it('sha256加密 "a"', () => {
    expect(Utils.sha256('a')).toBe(
      'ca978112ca1bbdcafac231b39a23dc4da786eff8147c4e72b9807785afee48bb',
    );
  });

  it('3DES加解密 "a"', () => {
    const encrypt = Utils.tripleDESencrypt('a');
    expect(Utils.tripleDESdecrypt(encrypt)).toBe('a');

    const key =
      'ClothingShopClothingShopClothingShopClothingShopClothingShopBBBB';
    const encrypt2 = Utils.tripleDESencrypt('a', key);
    expect(Utils.tripleDESdecrypt(encrypt2, key)).toBe('a');
  });

  it('base64加解密 "a"', () => {
    const base64 = Utils.stringToBase64('a');
    expect(Utils.base64ToString(base64)).toBe('a');
  });

  it('文件大小测试', () => {
    expect(Utils.getFileSize(256)).toBe('256B');
    expect(Utils.getFileSize(256 * 1024)).toBe('256KB');
    expect(Utils.getFileSize(256 * 1024 * 1024)).toBe('256MB');
    expect(Utils.getFileSize(256 * 1024 * 1024 * 1024)).toBe('256GB');
    expect(Utils.getFileSize(256 * 1024 * 1024 * 1024 * 1024)).toBe('256TB');

    expect(Utils.getFileSize(1.256 * 1024, 3)).toBe('1.256KB');
    expect(Utils.getFileSize(1.256 * 1024, 2)).toBe('1.26KB');
    expect(Utils.getFileSize(1.26 * 1024, 2)).toBe('1.26KB');
    expect(Utils.getFileSize(1.26 * 1024, 1)).toBe('1.3KB');
    expect(Utils.getFileSize(1.22 * 1024, 1)).toBe('1.2KB');
    expect(Utils.getFileSize(1.233 * 1024 * 1024, 2)).toBe('1.23MB');
    expect(Utils.getFileSize(1.71 * 1024 * 1024 * 1024, 1)).toBe('1.7GB');
  });
});
