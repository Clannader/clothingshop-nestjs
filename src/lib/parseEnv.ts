/**
 * Create by oliver.wu 2024/9/25
 */
import { join } from 'path';
import * as fs from 'fs';
import * as dotenv from 'dotenv';

class ParseEnv {
  private readonly envIni: Record<string, any> = {};

  constructor() {
    const iniPath = join(process.cwd(), '/config/config_example.ini'); // 这只是一个例子ini,并非真实配置
    if (fs.existsSync(iniPath)) {
      this.envIni = dotenv.parse(fs.readFileSync(iniPath));
      const pemPath = this.getPemPath();
      // 修改获取真实config.ini设置,覆盖例子的config内容
      const actualConfigPath = join(pemPath, 'config.ini');
      if (fs.existsSync(actualConfigPath)) {
        const actualConfig = dotenv.parse(fs.readFileSync(actualConfigPath));
        for (const [key, value] of Object.entries(actualConfig)) {
          this.envIni[key] = value;
        }
      }
    }
  }

  read(key: string) {
    return this.envIni[key];
  }

  getPemPath() {
    let pemPath = this.read('pemPath');
    if (pemPath == null || pemPath === '') {
      pemPath = join(process.cwd(), 'pem');
    }
    return pemPath;
  }

  getOauthName() {
    return this.read('oauthName') || 'oauth2-auth-code';
  }

  getEnvIni() {
    return this.envIni;
  }
}

const parseEnv: ParseEnv = new ParseEnv();

export default parseEnv;
