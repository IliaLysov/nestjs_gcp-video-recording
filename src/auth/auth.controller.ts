import {
    Body,
    Controller,
    Get,
    HttpException,
    HttpStatus,
    Post,
    Req,
    Res,
    UseGuards,
} from '@nestjs/common';
import { LocalAuthGuard } from './localStrategy/local-auth.guard';
import { AuthService } from './auth.service';
import { UserService } from 'src/user/user.service';

@Controller('auth')
export class AuthController {
    constructor(
        private authService: AuthService,
        private userService: UserService,
    ) {}
    @UseGuards(LocalAuthGuard)
    @Post('login')
    async login(@Req() req, @Res() res) {
        const accessToken = await this.authService.login(req.user);
        res.cookie('accessToken', accessToken, {
            httpOnly: true,
            secure: true,
            sameSite: 'strict',
        });
        res.redirect('/video');
    }

    @Post('send-code')
    async sendAuthCode(@Body() body) {
        try {
            const isExist = await this.userService.findOne(body.email);
            if (isExist)
                throw new HttpException(
                    `User with ${body.email} already exist`,
                    HttpStatus.BAD_REQUEST,
                );

            this.authService.generateAndSendAuthCode(body.email);
            return { message: 'success' };
        } catch (error) {
            if (error instanceof HttpException) throw error;

            throw new HttpException(
                'Something went wrong. Please try again later.',
                HttpStatus.INTERNAL_SERVER_ERROR,
            );
        }
    }

    @Post('register')
    async register(@Body() body) {
        try {
            const isExist = await this.userService.findOne(body.email);
            if (isExist)
                throw new HttpException(
                    `User with ${body.email} already exist`,
                    HttpStatus.BAD_REQUEST,
                );
            const verification = await this.authService.verifyAuthCode(
                body.email,
                body.code,
            );
            if (!verification)
                throw new HttpException(
                    'Invalid verification code',
                    HttpStatus.BAD_REQUEST,
                );

            const user = await this.userService.create(body);
            return user;
        } catch (error) {
            if (error instanceof HttpException) throw error;

            throw new HttpException(
                'Something went wrong. Please try again later.',
                HttpStatus.INTERNAL_SERVER_ERROR,
            );
        }
    }

    @Get('logout')
    async logout(@Res() res) {
        res.cookie('accessToken', '', { expires: new Date(0) });
        res.redirect('/signin');
    }
}
