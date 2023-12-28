import {
  Body,
  Controller,
  Get,
  Post,
  Render,
  UploadedFile,
  UseGuards,
  UseInterceptors,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { VideoService } from './video.service';
import { AuthGuard } from 'src/auth/auth.guart';
import { getMainUrl } from 'src/utils/url';

@Controller('video')
@UseGuards(AuthGuard)
export class VideoController {
  constructor(private readonly videoService: VideoService) {}

  @Get()
  @Render('video')
  video() {
    return {
      videoUploadUrl: `${getMainUrl()}/video/upload`,
    };
  }

  @Post('upload')
  @UseInterceptors(FileInterceptor('file', { dest: './uploads' }))
  uploadVideo(
    @UploadedFile() video: Express.Multer.File,
    @Body('done') done: string,
  ): string {
    const result = this.videoService.uploadVideo(video, done === 'true');
    return result;
  }
}
