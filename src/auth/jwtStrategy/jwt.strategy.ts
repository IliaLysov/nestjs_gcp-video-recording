import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { PassportStrategy } from '@nestjs/passport';
import { ExtractJwt, Strategy } from 'passport-jwt';
import { Socket } from 'socket.io';
import { User } from 'src/entities/user.entity';
import { UserService } from 'src/user/user.service';
import { getAccessTokenFromCookie } from 'src/utils/token';

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
    private accessToken: string;

    constructor(
        private configService: ConfigService,
        private userService: UserService,
    ) {
        super({
            jwtFromRequest: (req) => this.extractToken(req),
            ignoreExpiration: false,
            secretOrKey: configService.get('JWT_SECRET'),
        });
    }

    async validate(payload: any): Promise<User> {
        const tokenUser = { id: payload.sub, email: payload.email } as User;
        const user = await this.userService.findOne(tokenUser.email);
        if (!user) return null;
        if (this.accessToken !== user.accessToken) return null;
        return tokenUser;
    }

    private extractToken(req: any): string | null {
        if (req instanceof Socket) {
            const cookie = req.handshake.headers.cookie;
            const accessToken = getAccessTokenFromCookie(cookie);
            this.accessToken = accessToken;
            return accessToken;
        }

        return ExtractJwt.fromExtractors([
            (req) => {
                const accessToken = req.cookies['accessToken'];
                this.accessToken = accessToken;
                return accessToken;
            },
        ])(req);
    }
}
