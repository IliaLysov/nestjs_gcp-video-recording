import {
  Body,
  Controller,
  Post,
  UploadedFile,
  UseInterceptors,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { VideoService } from './video.service';

@Controller('video')
export class VideoController {
  constructor(private readonly videoService: VideoService) {}

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
