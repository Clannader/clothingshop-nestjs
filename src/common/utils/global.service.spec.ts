import { Test, TestingModule } from '@nestjs/testing';
import { GlobalService } from './global.service';
import {
  dateSdf,
  dbSession_Expires,
  Supervisor_Rights,
  userNameExp,
  tripleDES,
} from '../constants';

describe('GlobalService', () => {
  let service: GlobalService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [GlobalService],
    }).compile();

    service = module.get<GlobalService>(GlobalService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  it('测试英文翻译', () => {
    expect(service.lang('EN', '测试', 'user.userTest')).toBe('Testing');
  });

  it('测试中文翻译', () => {
    expect(service.lang('ZH', '测试', 'user.userTest')).toBe('测试');
  });

  it('测试中文带参数翻译', () => {
    expect(service.lang('ZH', '测试 {0}', 'user.userTestArgs', '哈哈')).toBe(
      '测试 哈哈',
    );
  });

  it('测试未定义翻译', () => {
    expect(service.lang('ZH', '测试你好', 'user.userHello')).toBe('测试你好');
  });

  it('测试未定义带参数翻译', () => {
    expect(service.lang('ZH', '测试{0}你好', 'user.userHello', '哈哈')).toBe(
      '测试哈哈你好',
    );
  });

  it('测试未定义带3个参数翻译', () => {
    expect(
      service.lang(
        'ZH',
        '测试{0}你好:{1},年龄:{2}',
        'user.userHello',
        '哈哈',
        'Oliver',
        28,
      ),
    ).toBe('测试哈哈你好:Oliver,年龄:28');
  });

  it('测试langKey不存在', () => {
    expect(service.lang('ZH', '测试', 'user.userHello.hehe')).toBe('测试');
  });

  it('测试langKey不存在,带参数', () => {
    expect(service.lang('ZH', '测试{0}', 'user.userHello.hehe', 10)).toBe(
      '测试10',
    );
  });

  it('测试获取全局静态参数 日期格式化格式', () => {
    expect(GlobalService.GlobalStatic.dateSdf).toBe(dateSdf);
  });

  it('测试获取全局静态参数 session过期时间', () => {
    expect(GlobalService.GlobalStatic.dbSession_Expires).toBe(
      dbSession_Expires,
    );
  });

  it('测试获取全局静态参数 用户名正则', () => {
    expect(GlobalService.GlobalStatic.userNameExp).toBe(userNameExp);
  });

  it('测试获取全局静态参数 权限组', () => {
    expect(GlobalService.GlobalStatic.Supervisor_Rights).toBe(
      Supervisor_Rights,
    );
  });

  it('测试获取全局静态参数 3DES参数', () => {
    expect(GlobalService.GlobalStatic.tripleDES).toBe(tripleDES);
    expect(GlobalService.GlobalStatic.tripleDES.key).toBe(tripleDES.key);
  });
});
