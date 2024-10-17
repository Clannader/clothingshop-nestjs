/**
 * Create by CC on 2022/7/24
 */
import { render } from 'ejs';
import { Inject, Injectable } from '@nestjs/common';
import { LanguageType } from '@/common';
import { Utils } from '@/common/utils';

@Injectable()
export class EmailUtils {
  getEmailTemplate(
    template: string,
    options: Record<string, any>,
    language: LanguageType = 'ZH',
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
            Utils.lang(language, `$t(${langKey})`, langKey),
          );
        }
      });
    }
    return content;
  }
}
