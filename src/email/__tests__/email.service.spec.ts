/**
 * Create by oliver.wu 2026/11/23
 * EmailService 单元测试:mock 掉 nodemailer,不真实连接 SMTP
 */
import { createTransport } from 'nodemailer';
import { EmailService, normalizeEmailConfig } from '@/email/services';
import { EmailUtils } from '@/email/email.utils';
import { ReqEmailDto } from '@/email/dto';
import { EmailConfig } from '@/email/types';
import { CodeException } from '@/common/exceptions';
import { CodeEnum } from '@/common/enum';

// nodemailer 在运行期只会用到 createTransport,这里 mock 掉避免测试时真实建连
jest.mock('nodemailer', () => ({ createTransport: jest.fn() }));

/** 捕获业务异常并返回,便于断言状态码与提示信息 */
async function catchCodeException(promise: Promise<unknown>): Promise<CodeException> {
  try {
    await promise;
  } catch (err) {
    return err as CodeException;
  }
  throw new Error('预期抛出 CodeException,但未抛出');
}

describe('EmailService', () => {
  const mockedCreateTransport = createTransport as jest.Mock;
  const emailConfig: EmailConfig = {
    smtpAddress: 'smtp.example.com',
    smtpPort: 465,
    smtpSender: 'no-reply@example.com',
    smtpPassword: 'secret',
  };
  let emailUtils: EmailUtils;
  let transporter: { verify: jest.Mock; sendMail: jest.Mock; close: jest.Mock };
  let emailService: EmailService;

  beforeEach(() => {
    transporter = { verify: jest.fn(), sendMail: jest.fn(), close: jest.fn() };
    mockedCreateTransport.mockReset();
    mockedCreateTransport.mockReturnValue(transporter);
    emailUtils = new EmailUtils();
    emailService = new EmailService(emailConfig, emailUtils);
  });

  it('构造时按配置创建 transporter,465 端口启用 secure 并携带 auth', () => {
    expect(mockedCreateTransport).toHaveBeenCalledWith({
      host: 'smtp.example.com',
      port: 465,
      secure: true,
      auth: { user: 'no-reply@example.com', pass: 'secret' },
    });
  });

  it('未配置密码时不传 auth,非 465 端口不启用 secure', () => {
    new EmailService({ ...emailConfig, smtpPort: 587, smtpPassword: '' }, emailUtils);
    expect(mockedCreateTransport).toHaveBeenLastCalledWith({
      host: 'smtp.example.com',
      port: 587,
      secure: false,
    });
  });

  it('传 template 时复用 EmailUtils 渲染 ejs 模板并发送', async () => {
    const sentInfo = { messageId: '<123@example.com>', response: '250 OK' };
    transporter.sendMail.mockResolvedValue(sentInfo);
    const dto: ReqEmailDto = {
      to: 'user@example.com',
      subject: '验证码',
      template: '<p>Hello <%= options.userName %></p>',
      options: { userName: 'zhangsan' },
      language: 'ZH',
    };

    const result = await emailService.sendMail(dto);

    expect(transporter.sendMail).toHaveBeenCalledWith({
      from: 'no-reply@example.com',
      to: ['user@example.com'],
      subject: '验证码',
      html: '<p>Hello zhangsan</p>',
    });
    expect(result).toEqual(sentInfo);
  });

  it('传 html 时直接使用 html 内容,不走模板渲染', async () => {
    transporter.sendMail.mockResolvedValue({});
    const spy = jest.spyOn(emailUtils, 'getEmailTemplate');

    await emailService.sendMail({
      to: ['a@example.com', ' b@example.com ', '', 'a@example.com'],
      subject: 'subject',
      html: '<b>hi</b>',
    });

    expect(spy).not.toHaveBeenCalled();
    expect(transporter.sendMail).toHaveBeenCalledWith(
      expect.objectContaining({ to: ['a@example.com', 'b@example.com'], html: '<b>hi</b>' }),
    );
  });

  it('template 与 html 都为空时抛出业务异常', async () => {
    const err = await catchCodeException(
      emailService.sendMail({ to: 'a@example.com', subject: 'subject' }),
    );
    expect(err.getStatus()).toBe(CodeEnum.EXCEPTION);
    expect(err.getResponse()).toMatchObject({
      message: expect.stringContaining('至少需要提供一个'),
    });
  });

  it('收件人为空时抛出业务异常且不调用 sendMail', async () => {
    const err = await catchCodeException(
      emailService.sendMail({ to: '  ', subject: 'subject', html: '<b>hi</b>' }),
    );
    expect(err.getStatus()).toBe(CodeEnum.EXCEPTION);
    expect(transporter.sendMail).not.toHaveBeenCalled();
  });

  it('发送失败时抛出 CodeException 并携带底层错误信息', async () => {
    transporter.sendMail.mockRejectedValue(new Error('connect ECONNREFUSED'));
    const err = await catchCodeException(
      emailService.sendMail({ to: 'a@example.com', subject: 'subject', html: '<b>hi</b>' }),
    );
    expect(err.getStatus()).toBe(CodeEnum.EXCEPTION);
    expect(err.getResponse()).toMatchObject({
      message: expect.stringContaining('connect ECONNREFUSED'),
    });
  });

  it('verify 成功返回 true,失败抛出 CodeException', async () => {
    transporter.verify.mockResolvedValue(true);
    await expect(emailService.verify()).resolves.toBe(true);

    transporter.verify.mockRejectedValue(new Error('Invalid login'));
    const err = await catchCodeException(emailService.verify());
    expect(err.getStatus()).toBe(CodeEnum.EXCEPTION);
    expect(err.getResponse()).toMatchObject({
      message: expect.stringContaining('Invalid login'),
    });
  });

  it('close 时关闭 transporter 连接', () => {
    emailService.close();
    expect(transporter.close).toHaveBeenCalledTimes(1);
  });

  it('normalizeEmailConfig 端口转数字,非法端口回退默认 25', () => {
    expect(normalizeEmailConfig({ smtpPort: '587' }).smtpPort).toBe(587);
    expect(normalizeEmailConfig({ smtpPort: 'abc' }).smtpPort).toBe(25);
    expect(normalizeEmailConfig({}).smtpPort).toBe(25);
  });
});
