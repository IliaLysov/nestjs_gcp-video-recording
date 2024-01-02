import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { PassportStrategy } from '@nestjs/passport';
import { ExtractJwt, Strategy } from 'passport-jwt';
import { Socket } from 'socket.io';
import { User } from 'src/user/user.entity';

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
  constructor(private configService: ConfigService) {
    super({
      jwtFromRequest: (req) => this.extractToken(req),
      ignoreExpiration: false,
      secretOrKey: configService.get('JWT_SECRET'),
    });
  }

  async validate(payload: any): Promise<User> {
    return { id: payload.sub, email: payload.email } as User; //this user will be injected into req.user
  }

  private extractToken(req: any): string | null {
    // Check if the request is a WebSocket handshake
    if (req instanceof Socket) {
      const cookie = req.handshake.headers.cookie;
      const accessToken = cookie
        .split(';')
        .find((c) => c.trim().startsWith('accessToken='))
        .split('=')[1];
      return accessToken;
    }

    // Check if the request is an HTTP request
    return ExtractJwt.fromExtractors([
      (req) => {
        return req.cookies['accessToken'];
      },
    ])(req);
  }
}
