import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Video } from 'src/entities/video.entity';
import { Repository } from 'typeorm';

@Injectable()
export class VideoService {
    constructor(
        @InjectRepository(Video)
        private videoRepository: Repository<Video>,
    ) {}

    create(userId: string, videoName: string, size: number): void {
        this.videoRepository.save({
            user: {
                id: userId,
            },
            name: videoName,
            size,
        });
    }

    delete(videoName: string): void {
        this.videoRepository.delete({ name: videoName });
    }
}
