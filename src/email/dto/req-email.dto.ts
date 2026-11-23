/**
 * Create by oliver.wu 2026/11/23
 */
import { Expose } from 'class-transformer';
import {
  IsDefined,
  IsEnum,
  IsObject,
  IsOptional,
  IsString,
} from 'class-validator';
import { LanguageType } from '@/common';
import { LanguageEnum } from '@/common/enum';

export class ReqEmailDto {
  /**
   * 收件人邮箱地址,支持单个地址或多个地址数组
   * @example ['user@example.com']
   */
  @IsDefined()
  @Expose()
  to: string[] | string;

  /**
   * 邮件主题
   * @example 验证码
   */
  @IsDefined()
  @IsString()
  @Expose()
  subject: string;

  /**
   * 邮件模板内容(ejs 模板字符串),与 html 二选一,优先级高于 html
   * @example <p>Hello <%= options.userName %></p>
   */
  @IsOptional()
  @IsString()
  @Expose()
  template?: string;

  /**
   * 模板渲染参数,配合 template 使用
   */
  @IsOptional()
  @IsObject()
  @Expose()
  options?: Record<string, any>;

  /**
   * 模板渲染语言,不传默认中文
   * @example ZH
   */
  @IsOptional()
  @IsEnum(LanguageEnum)
  @Expose()
  language?: LanguageType = 'ZH';

  /**
   * 邮件正文 html 内容,不使用模板时直接传入
   */
  @IsOptional()
  @IsString()
  @Expose()
  html?: string;
}
