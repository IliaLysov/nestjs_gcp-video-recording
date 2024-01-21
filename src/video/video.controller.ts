import { Controller, Get, Logger, Param, Res } from '@nestjs/common';
import { VideoService } from './video.service';
import { GcsService } from 'src/gcs/gcs.service';
import { decryptString } from 'src/utils/crypto';
import { Response } from 'express';

@Controller('video')
export class VideoController {
    private readonly logger = new Logger(VideoController.name);

    constructor(
        private videoService: VideoService,
        private gcsService: GcsService,
    ) {}

    @Get('download/:videoToken')
    async download(
        @Param('videoToken') videoToken: string,
        @Res() res: Response,
    ) {
        const videoName = decryptString(videoToken);
        const [Buffer] = await this.gcsService.getVideoFromGcs(videoName);
        res.send(Buffer);
    }

    @Get('clean')
    async clean() {
        try {
            await this.videoService.deleteOutdatedVideos();
        } catch (error) {
            this.logger.error(`Error cleaning videos: ${error.message}`);
        }
    }
}
