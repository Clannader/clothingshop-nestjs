import { Utils } from './utils';

describe('Utils', () => {

  it('32位系统路径转义', () => {
    process.platform === 'win32'
    expect(Utils.escapePath('/src/config\configService\index')).toBe('\src\config\configService\index');
  });

  it('64位系统路径转义', () => {
    expect(Utils.escapePath('/src/config\configService\index')).toBe('/src/config/configService/index');
  });

  it('特殊字符转义', () => {
    expect(Utils.escapeString('src\[config]\$ini')).toBe('src\\\[config\]\\\$ini');
  });

  it('md5加密 "a"', () => {
    expect(Utils.md5('a')).toBe('0cc175b9c0f1b6a831c399e269772661');
  });

});
