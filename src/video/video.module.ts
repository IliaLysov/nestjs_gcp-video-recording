import { Module } from '@nestjs/common';
import { VideoService } from './video.service';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Video } from 'src/entities/video.entity';
import { VideoController } from './video.controller';

@Module({
    imports: [TypeOrmModule.forFeature([Video])],
    providers: [VideoService],
    exports: [VideoService],
    controllers: [VideoController],
})
export class VideoModule {}
