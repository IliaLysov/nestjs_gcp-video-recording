import { ExecutionContext, Injectable } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';

@Injectable()
export class JwtAuthGuard extends AuthGuard('jwt') {
    handleRequest<TUser = any>(
        err: any,
        user: any,
        info: any,
        context: ExecutionContext,
        status?: any,
    ): TUser {
        const res = context.switchToHttp().getResponse();
        if (err || !user) {
            res.redirect('/signin');
            return super.handleRequest(err, user, info, context, status);
        }

        return user;
    }
}
