/**
 * Create by CC on 2022/5/18
 */
import { INestApplication } from '@nestjs/common';
import { Test } from '@nestjs/testing';
import { ConfigTestModule } from '@T/config/config.test.module';
import { ConfigService } from '@/common/config';
import { readFileSync, writeFileSync } from 'fs';
import { join } from 'path';

describe('ConfigService 测试不开启watch Ini文件', () => {
  let service: ConfigService;
  let app: INestApplication;
  const delay = (time: number) =>
    new Promise((resolve) => setTimeout(() => resolve(''), time));

  beforeEach(async () => {
    const module = await Test.createTestingModule({
      imports: [ConfigTestModule.watchFalseIniFile()],
    }).compile();
    app = module.createNestApplication();
    await app.init();
    service = app.get<ConfigService>(ConfigService);
  });

  it(`ConfigService测试`, () => {
    const iniPath = join(__dirname, '../..', 'src/config/config.ini');
    const iniContent = readFileSync(iniPath, 'utf-8').toString();
    service.set('AA', 'Hello');
    const setIniContent = readFileSync(iniPath, 'utf-8').toString();
    expect(setIniContent).toBe(iniContent);

    service.set('AA', '');
    const setIniContent2 = readFileSync(iniPath, 'utf-8').toString();
    expect(setIniContent2).toBe(iniContent); // 这里由于写入文件的时候没有\r\n所以和之前的对比要删掉
    // 并且\r\n只是占了2个字符的长度
  });

  it(`ConfigService测试文件写入2`, async () => {
    const iniPath = join(__dirname, '../..', 'src/config/config.ini');
    const iniContent = readFileSync(iniPath, 'utf-8').toString();
    writeFileSync(
      iniPath,
      iniContent.endsWith('\r\n')
        ? iniContent + 'AA=Hello'
        : iniContent + '\r\nAA=Hello',
    );
    await delay(1000);
    expect(service.get('AA')).toBeUndefined();
    writeFileSync(iniPath, iniContent.replace('\r\nAA=Hello', ''));
  });

  afterEach(async () => {
    await app.close();
  });
});
