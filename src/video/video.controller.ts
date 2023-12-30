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
import { getMainUrl } from 'src/utils/url';
import { JwtAuthGuard } from 'src/auth/jwtStrategy/jwt-auth.guard';

@Controller('video')
export class VideoController {
  constructor(private readonly videoService: VideoService) {}

  @UseGuards(JwtAuthGuard)
  @Get()
  @Render('video')
  video() {
    return {
      videoUploadUrl: `${getMainUrl()}/video/upload`,
    };
  }

  @UseGuards(JwtAuthGuard)
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
