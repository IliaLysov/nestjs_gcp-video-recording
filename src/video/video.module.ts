import { Module } from '@nestjs/common';
import { VideoService } from './video.service';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Video } from 'src/entities/video.entity';

@Module({
    imports: [TypeOrmModule.forFeature([Video])],
    providers: [VideoService],
    exports: [VideoService],
})
export class VideoModule {}
