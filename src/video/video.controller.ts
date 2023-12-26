import {
  Body,
  Controller,
  Get,
  Post,
  Render,
  UploadedFile,
  UseInterceptors,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { VideoService } from './video.service';
import * as os from 'os';

@Controller('video')
export class VideoController {
  constructor(private readonly videoService: VideoService) {}

  @Get()
  @Render('video')
  video() {
    const netwerkInterfaces = os.networkInterfaces();
    const baseUrl = `https://${netwerkInterfaces.en0[1].address}:${process.env.NEST_PORT}/video/upload`;
    return {
      videoUploadUrl: baseUrl,
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
