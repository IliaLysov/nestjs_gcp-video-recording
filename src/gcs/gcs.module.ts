import { Module } from '@nestjs/common';
import { GcsService } from './gcs.service';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Video } from 'src/entities/video.entity';

@Module({
    imports: [TypeOrmModule.forFeature([Video])],
    providers: [GcsService],
    exports: [GcsService],
})
export class GcsModule {}
