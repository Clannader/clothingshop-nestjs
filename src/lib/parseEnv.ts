/**
 * Create by oliver.wu 2024/9/25
 */
import { join } from 'path';
import * as fs from 'fs';
import * as dotenv from 'dotenv';

class ParseEnv {
  private readonly envIni: Record<string, any> = {};

  constructor() {
    const iniPath = join(process.cwd(), '/config/config.ini');
    if (fs.existsSync(iniPath)) {
      this.envIni = dotenv.parse(fs.readFileSync(iniPath));
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
    return this.read('oauthName') || 'oauth2-auth-code'
  }
}

const parseEnv: ParseEnv = new ParseEnv();

export default parseEnv;
