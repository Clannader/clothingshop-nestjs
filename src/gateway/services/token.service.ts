/**
 * Create by CC on 2022/8/9
 */
import { Injectable, Inject } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { CmsSession } from '@/common';

@Injectable()
export class TokenService {
  @Inject()
  private readonly jwtService: JwtService;

  /**
   * 生成token
   * @param session
   */
  generateToken(session: CmsSession) {
    return this.jwtService.sign(session, { expiresIn: session.expires });
  }
}
