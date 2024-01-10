import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { EmailService } from 'src/email/email.service';
import { Video } from 'src/entities/video.entity';
import { emailTemplates } from 'src/utils/emailTemplates';
import { getMainUrl } from 'src/utils/url';
import { Repository } from 'typeorm';
import { encryptString } from 'src/utils/crypto';

@Injectable()
export class VideoService {
    constructor(
        @InjectRepository(Video)
        private videoRepository: Repository<Video>,
        private emailService: EmailService,
    ) {}

    saveVideoInfoToDB(userId: string, videoName: string, size: number): void {
        this.videoRepository.save({
            user: {
                id: userId,
            },
            name: videoName,
            size,
        });
    }

    deleteVidoeInfoFromDB(videoName: string): void {
        this.videoRepository.delete({ name: videoName });
    }

    private createDeepLink(videoName: string): string {
        const videoToken = encryptString(videoName);
        return `${getMainUrl()}/download/${videoToken}`;
    }

    sendDeepLinkToEmail(email: string, videoName: string): void {
        const deepLink = this.createDeepLink(videoName);
        const html = emailTemplates.VIDEO_LINK(deepLink, email, email);
        this.emailService.sendEmailWithDelay(
            email,
            `Link to video from ${email}`,
            html,
        );
    }

    async getVideoInfo(videoName: string): Promise<Video> {
        return this.videoRepository.findOneBy({ name: videoName });
    }
}
