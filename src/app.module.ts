import { Module } from '@nestjs/common';
import { VideoModule } from './video/video.module';
import { ServeStaticModule } from '@nestjs/serve-static';
import { join } from 'path';

@Module({
  imports: [
    VideoModule,
    ServeStaticModule.forRoot({
      rootPath: join(__dirname, '..', 'views'),
    }),
  ],
})
export class AppModule {}
