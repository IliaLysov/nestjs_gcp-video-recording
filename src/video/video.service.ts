import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Video } from 'src/entities/video.entity';
import { LessThan, Repository } from 'typeorm';
import { Cron } from '@nestjs/schedule';
import { GcsService } from 'src/gcs/gcs.service';

@Injectable()
export class VideoService {
    constructor(
        @InjectRepository(Video)
        private videoRepository: Repository<Video>,
        private gcsService: GcsService,
    ) {}

    async getVideoInfo(videoName: string): Promise<Video> {
        return this.videoRepository.findOneBy({ name: videoName });
    }

    async countUserVideosSize(userId: string): Promise<number> {
        const videos = await this.videoRepository
            .createQueryBuilder('video')
            .innerJoinAndSelect('video.user', 'user')
            .where('user.id = :userId', { userId })
            .getMany();
        return videos.reduce((acc, video) => acc + video.size, 0);
    }

    @Cron('0 0 * * *')
    async deleteOutdatedVideos(): Promise<void> {
        const twentyFourHoursAgo = new Date();
        twentyFourHoursAgo.setHours(twentyFourHoursAgo.getHours() - 24);

        const outdatedVideos = await this.videoRepository.find({
            where: {
                createdAt: LessThan(twentyFourHoursAgo),
            },
        });

        for (const video of outdatedVideos) {
            this.videoRepository.delete({ name: video.name });
            this.gcsService.deleteFile(video.name);
        }
    }
}
