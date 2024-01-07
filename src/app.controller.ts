import { Controller, Get, Param, Render, UseGuards } from '@nestjs/common';
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
            sendAuthCodeUrl: `${getMainUrl()}/auth/send-code`,
            registerUrl: `${getMainUrl()}/auth/register`,
        };
    }

    @UseGuards(JwtAuthGuard)
    @Get('video')
    @Render('video')
    video() {
        return {
            signOutUrl: `${getMainUrl()}/auth/logout`,
            videoUploadUrl: `${getMainWsUrl()}`,
        };
    }

    @Get('download/:videoToken')
    @Render('download')
    download(@Param('videoToken') videoToken: string) {
        return {
            downloadUrl: `${getMainUrl()}/video/download/${videoToken}`,
        };
    }
}
