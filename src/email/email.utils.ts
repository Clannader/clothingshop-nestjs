/**
 * Create by CC on 2022/7/24
 */
import { render } from 'ejs';
import { Inject, Injectable } from '@nestjs/common';
import { GlobalService, languageType } from '@/common';

@Injectable()
export class EmailUtils {
  @Inject()
  private readonly globalService: GlobalService;

  getEmailTemplate(
    template: string,
    options: Record<string, any>,
    language: languageType = 'ZH',
  ) {
    let content = render(template, {
      options,
    });
    const regex = new RegExp(/\$t\(.+?\)/g);
    const matches = content.match(regex);
    if (matches) {
      matches.forEach((v) => {
        const langKeyMatch = v.match(/\'(.*)\'/);
        if (langKeyMatch) {
          const langKey = langKeyMatch[1];
          content = content.replace(
            v,
            this.globalService.lang(language, `$t(${langKey})`, langKey),
          );
        }
      });
    }
    return content;
  }
}
