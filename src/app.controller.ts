import { Controller, Get, Param, Render, UseGuards } from '@nestjs/common';
import { getMainUrl, getMainWsUrl } from './utils/url';
import { JwtAuthGuard } from './auth/jwtStrategy/jwt-auth.guard';
import { decryptString } from './utils/crypto';
import { VideoService } from './video/video.service';

@Controller()
export class AppController {
    constructor(private videoService: VideoService) {}

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
        try {
            const videoName = decryptString(videoToken);
            this.videoService.getVideoInfo(videoName);

            return {
                downloadUrl: `${getMainUrl()}/video/download/${videoToken}`,
            };
        } catch (error) {
            return {
                error: 'Invalid video token',
            };
        }
    }
}
