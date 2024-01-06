import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { PassportStrategy } from '@nestjs/passport';
import { ExtractJwt, Strategy } from 'passport-jwt';
import { Socket } from 'socket.io';
import { User } from 'src/user/user.entity';
import { getAccessTokenFromCookie } from 'src/utils/token';

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
        return { id: payload.sub, email: payload.email } as User;
    }

    private extractToken(req: any): string | null {
        if (req instanceof Socket) {
            const cookie = req.handshake.headers.cookie;
            const accessToken = getAccessTokenFromCookie(cookie);
            return accessToken;
        }

        return ExtractJwt.fromExtractors([
            (req) => {
                return req.cookies['accessToken'];
            },
        ])(req);
    }
}
