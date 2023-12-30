import {
  Controller,
  Get,
  Post,
  Render,
  Req,
  UploadedFile,
  UseGuards,
  UseInterceptors,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { VideoService } from './video.service';
import { getMainUrl } from 'src/utils/url';
import { JwtAuthGuard } from 'src/auth/jwtStrategy/jwt-auth.guard';
import { Request } from 'express';

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
    @Req() req: Request,
    @UploadedFile() video: Express.Multer.File,
  ): string {
    const result = this.videoService.uploadVideo(video, req.user);
    return result;
  }
}
