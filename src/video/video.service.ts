import { Injectable, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Video } from 'src/entities/video.entity';
import { LessThan, Repository } from 'typeorm';
import { GcsService } from 'src/gcs/gcs.service';

@Injectable()
export class VideoService {
    private readonly logger = new Logger(VideoService.name);

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

    async deleteOutdatedVideos(): Promise<void> {
        this.logger.debug('CRON schedule. Deleting outdated videos...');
        const twentyFourHoursAgo = new Date();
        twentyFourHoursAgo.setHours(twentyFourHoursAgo.getHours() - 24);

        const outdatedVideo = await this.videoRepository.find({
            where: {
                createdAt: LessThan(twentyFourHoursAgo),
            },
        });
        const videoNames = outdatedVideo.map((video) => video.name);

        videoNames.forEach(async (videoName) => {
            await this.gcsService.deleteFile(videoName);
            await this.videoRepository.delete({ name: videoName });
        });
    }
}
