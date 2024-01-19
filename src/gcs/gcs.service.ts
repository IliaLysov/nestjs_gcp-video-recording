import { Bucket, DownloadResponse, Storage } from '@google-cloud/storage';
import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { InjectRepository } from '@nestjs/typeorm';
import { EmailService } from 'src/email/email.service';
import { Video } from 'src/entities/video.entity';
import { UserInfo } from 'src/utils/types';
import { Writable } from 'stream';
import { Repository } from 'typeorm';

type StreamInfo = {
    stream: Writable;
    fileName: string;
    size: number;
};

@Injectable()
export class GcsService {
    private readonly storage: Storage;
    private readonly bucket: Bucket;

    private pendingFinishStreamTimers: Map<string, NodeJS.Timeout> = new Map();

    private streamsInfoMap: Map<string, StreamInfo> = new Map();

    private readonly timeout: number = 30000; // 30 seconds

    private readonly maxFileSize: number = 100000000; // 100 MB

    constructor(
        @InjectRepository(Video)
        private videoRepository: Repository<Video>,
        private configService: ConfigService,
        private emailService: EmailService,
    ) {
        this.storage = new Storage({
            projectId: this.configService.get('GCS_PROJECT_ID'),
            keyFilename: this.configService.get('GCS_SERVICE_ACCOUNT_KEY_FILE'),
        });
        this.bucket = this.storage.bucket(
            this.configService.get('GCS_BUCKET_NAME'),
        );
    }

    private initializeStream(userId: string): void {
        const fileName = `${userId}_${new Date().toUTCString()}.webm`;
        const file = this.bucket.file(fileName);
        const stream = file.createWriteStream({
            metadata: {
                contentType: 'video/webm',
            },
        });
        this.streamsInfoMap.set(userId, { stream, fileName, size: 0 });
    }

    private getOrCreateStreamInfo(userId: string): StreamInfo {
        if (!this.streamsInfoMap.has(userId)) {
            this.initializeStream(userId);
        }

        return this.streamsInfoMap.get(userId)!;
    }

    private resetTimer(user: UserInfo): void {
        if (this.pendingFinishStreamTimers.has(user.id)) {
            clearTimeout(this.pendingFinishStreamTimers.get(user.id)!);
        }

        const timer = setTimeout(() => {
            this.endVideoStream(user);
        }, this.timeout);

        this.pendingFinishStreamTimers.set(user.id, timer);
    }

    uploadVideoChunk(chunk: Buffer, user: UserInfo): void {
        const streamInfo = this.getOrCreateStreamInfo(user.id);
        streamInfo.stream.write(chunk);
        streamInfo.size += chunk.byteLength;

        if (streamInfo.size > this.maxFileSize) {
            this.endVideoStream(user);
        }

        this.resetTimer(user);
    }

    endVideoStream(user: UserInfo): void {
        const streamInfo = this.streamsInfoMap.get(user.id);
        streamInfo.stream.end();
        this.streamsInfoMap.delete(user.id);

        clearTimeout(this.pendingFinishStreamTimers.get(user.id));
        this.pendingFinishStreamTimers.delete(user.id);

        this.videoRepository.save({
            user: {
                id: user.id,
            },
            name: streamInfo.fileName,
            size: streamInfo.size,
        });

        this.emailService.sendDeepLinkToEmail(user.email, streamInfo.fileName);
    }

    async deleteFile(fileName: string): Promise<void> {
        await this.bucket.file(fileName).delete();
    }

    getVideoFromGcs(fileName: string): Promise<DownloadResponse> {
        return this.bucket.file(fileName).download();
    }

    streamVideoFromGcs(fileName: string): NodeJS.ReadableStream {
        return this.bucket.file(fileName).createReadStream();
    }
}
