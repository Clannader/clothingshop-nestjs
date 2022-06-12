import { INestApplication } from '@nestjs/common';
import { Test } from '@nestjs/testing';
import { AppModule } from '@T/config/app.module';
import { ConfigService } from '@/common';

describe('ConfigService 加载带参变量', () => {
  let service: ConfigService;
  let app: INestApplication;

  beforeEach(async () => {
    const module = await Test.createTestingModule({
      imports: [AppModule.loadExpandVar()],
    }).compile();
    app = module.createNestApplication();
    await app.init();
    service = app.get<ConfigService>(ConfigService);
  });

  it(`ConfigService测试`, () => {
    service.set('myName', 'oliver');
    service.set('age', 28);
    service.set('myTitle', 'My name is ${myName}');
    service.set('myInfo', 'My name is ${myName}, age is ${age}');
    expect(service.get<string>('URL')).toBe('myapp.test');
    expect(service.get<string>('EMAIL')).toBe('support@myapp.test');
    expect(service.get<string>('myName')).toBe('oliver');
    expect(service.get<string>('myTitle')).toBe('My name is oliver');
    expect(service.get<string>('myInfo')).toBe('My name is oliver, age is 28');
    expect(service.get<string>('dbUrl')).toBe(
      'M9kB1vUOFHzgzHa2VeIUkgeMZJ/4SQzeJ6ehKlLZPTz6fmy7SBEY2A==',
    );
    expect(service.getSecurityConfig('dbUrl')).toBe(
      'M9kB1vUOFHzgzHa2VeIUkgeMZJ/4SQzeJ6ehKlLZPTz6fmy7SBEY2A==',
    );
    // 测试完了回退数据
    service.set('myName', '');
    service.set('age', '');
    service.set('myTitle', '');
    service.set('myInfo', '');
  });

  afterEach(async () => {
    await app.close();
  });
});
