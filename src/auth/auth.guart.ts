import { CanActivate, ExecutionContext, Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { JwtService } from '@nestjs/jwt';
import { Request } from 'express';

@Injectable()
export class AuthGuard implements CanActivate {
  constructor(
    private jwtService: JwtService,
    private configService: ConfigService,
  ) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const req = context.switchToHttp().getRequest();
    const res = context.switchToHttp().getResponse();
    const accessToken = this.extractTokenFromCookie(req);
    if (!accessToken) {
      res.redirect('/signin');
      return false;
    }

    try {
      // add password hash to the accessToken and check it with db account password hash
      const payload = this.jwtService.verify(accessToken, {
        secret: this.configService.get('JWT_SECRET'),
      });
      req.user = payload;
      return true;
    } catch (error) {
      res.redirect('/signin');
      return false;
    }
  }

  private extractTokenFromCookie(req: Request) {
    if (!req || !req.cookies) return null;
    return req.cookies['accessToken'];
  }
}
