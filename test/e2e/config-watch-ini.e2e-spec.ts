/**
 * Create by CC on 2022/5/18
 */
import { INestApplication } from '@nestjs/common';
import { Test } from '@nestjs/testing';
import { AppModule } from '../src/app.module';
import { ConfigService } from '../../src/common/config';
import { readFileSync, writeFileSync } from 'fs';
import { join } from 'path';

describe('ConfigService 观察ini文件', () => {
  let service: ConfigService;
  let app: INestApplication;

  beforeEach(async () => {
    const module = await Test.createTestingModule({
      imports: [AppModule.watchIniFile()],
    }).compile();
    app = module.createNestApplication();
    await app.init();
    service = app.get<ConfigService>(ConfigService);
  });

  it(`ConfigService测试`, async () => {
    const iniPath = join(__dirname, '..', 'src/config.ini')
    const iniContent = readFileSync(iniPath, 'utf-8').toString()
    service.set('AA', 'Hello')
    const setIniContent = readFileSync(iniPath, 'utf-8').toString()
    expect(setIniContent).toBe(iniContent + 'AA=Hello')

    service.set('AA', '');
    const setIniContent2 = readFileSync(iniPath, 'utf-8').toString()
    expect(setIniContent2).toBe(iniContent.substring(0, iniContent.length - 4))
  });

  afterEach(async () => {
    await app.close();
  });
});
