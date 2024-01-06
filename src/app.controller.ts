import { Controller, Get, Render, UseGuards } from '@nestjs/common';
import { getMainUrl, getMainWsUrl } from './utils/url';
import { JwtAuthGuard } from './auth/jwtStrategy/jwt-auth.guard';

@Controller()
export class AppController {
    @Get('signin')
    @Render('signin')
    signIn() {
        return {
            signInUrl: `${getMainUrl()}/auth/login`,
        };
    }

    @Get('signup')
    @Render('signup')
    signUp() {
        return {
            signUpUrl: `${getMainUrl()}/user/create`,
        };
    }

    @UseGuards(JwtAuthGuard)
    @Get('video')
    @Render('video')
    video() {
        return {
            videoUploadUrl: `${getMainWsUrl()}`,
        };
    }
}
