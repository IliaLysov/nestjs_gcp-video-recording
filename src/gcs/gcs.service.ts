import { Bucket, DownloadResponse, Storage } from '@google-cloud/storage';
import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { VideoService } from 'src/video/video.service';
import { Writable } from 'stream';

type StreamInfo = {
    stream: Writable;
    fileName: string;
    size: number;
};

@Injectable()
export class GcsService {
    private readonly storage: Storage;
    private readonly bucket: Bucket;

    private cloudFilesDeletionTimers: Map<string, NodeJS.Timeout> = new Map();
    private pendingFinishStreamTimers: Map<string, NodeJS.Timeout> = new Map();

    private streamsInfoMap: Map<string, StreamInfo> = new Map();

    private readonly timeout: number = 30000; // 30 seconds
    private readonly timeToKeepFiles: number = 1000 * 60 * 60 * 24 * 1; // 1 days

    constructor(
        private configService: ConfigService,
        private videoService: VideoService,
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

    private resetTimer(userId: string): void {
        if (this.pendingFinishStreamTimers.has(userId)) {
            clearTimeout(this.pendingFinishStreamTimers.get(userId)!);
        }

        const timer = setTimeout(() => {
            this.endVideoStream(userId);
        }, this.timeout);

        this.pendingFinishStreamTimers.set(userId, timer);
    }

    uploadVideoChunk(chunk: Buffer, userId: string): void {
        const streamInfo = this.getOrCreateStreamInfo(userId);
        streamInfo.stream.write(chunk);
        streamInfo.size += chunk.byteLength;

        this.resetTimer(userId);
    }

    endVideoStream(userId: string): void {
        const streamInfo = this.streamsInfoMap.get(userId);
        streamInfo.stream.end();
        this.streamsInfoMap.delete(userId);

        clearTimeout(this.pendingFinishStreamTimers.get(userId));
        this.pendingFinishStreamTimers.delete(userId);
        console.log(`Stream ends for ${userId}`);

        this.videoService.create(userId, streamInfo.fileName, streamInfo.size);

        this.deleteFileWithDelay(streamInfo.fileName);
    }

    private deleteFile(fileName: string): void {
        this.bucket.file(fileName).delete();
        this.videoService.delete(fileName);
    }

    private deleteFileWithDelay(fileName: string): void {
        const timer = setTimeout(() => {
            this.deleteFile(fileName);
            this.cloudFilesDeletionTimers.delete(fileName);
        }, this.timeToKeepFiles);

        this.cloudFilesDeletionTimers.set(fileName, timer);
    }

    getVideoFromGcs(fileName: string): Promise<DownloadResponse> {
        return this.bucket.file(fileName).download();
    }

    streamVideoFromGcs(fileName: string): NodeJS.ReadableStream {
        return this.bucket.file(fileName).createReadStream();
    }
}
