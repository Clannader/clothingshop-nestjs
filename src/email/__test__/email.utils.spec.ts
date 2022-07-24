/**
 * Create by CC on 2022/7/24
 */
import { Test, TestingModule } from '@nestjs/testing';
import { EmailUtils } from '@/email/email.utils';
import { CommonModule } from '@/common';
import { readFileSync } from 'fs';

describe('EmailUtils', () => {
  let emailUtils: EmailUtils;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      imports: [CommonModule],
      providers: [EmailUtils],
    }).compile();

    emailUtils = module.get<EmailUtils>(EmailUtils);
  });

  it('邮件模板获取', () => {
    const templateContent = readFileSync(__dirname + '/../template/test.html');
    const options = {
      userName: 'zhangsan',
      userAge: 28,
      url: 'http://localhost:3000/index',
    };
    const enContent = readFileSync(__dirname + '/test.en.html').toString();
    const zhContent = readFileSync(__dirname + '/test.zh.html').toString();
    expect(
      emailUtils.getEmailTemplate(templateContent.toString(), options),
    ).toBe(zhContent);
    expect(
      emailUtils.getEmailTemplate(templateContent.toString(), options, 'EN'),
    ).toBe(enContent);
  });
});
