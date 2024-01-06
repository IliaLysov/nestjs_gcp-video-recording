import { Bucket, Storage } from '@google-cloud/storage';
import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { Writable } from 'stream';

@Injectable()
export class GcsService {
    private readonly storage: Storage;
    private readonly bucket: Bucket;

    private writableStreamMap: Map<string, Writable> = new Map();
    private pendingTimers: Map<string, NodeJS.Timeout> = new Map();

    private readonly timeout: number = 30000;

    constructor(private configService: ConfigService) {
        this.storage = new Storage({
            projectId: this.configService.get('GCS_PROJECT_ID'),
            keyFilename: this.configService.get('GCS_SERVICE_ACCOUNT_KEY_FILE'),
        });
        this.bucket = this.storage.bucket(
            this.configService.get('GCS_BUCKET_NAME'),
        );
    }

    private initializeWritableStream(userId: string): void {
        const fileName = `${userId}_${new Date().toUTCString()}.webm`;
        const file = this.bucket.file(fileName);
        const stream = file.createWriteStream({
            metadata: {
                contentType: 'video/webm',
            },
        });
        this.writableStreamMap.set(userId, stream);
    }

    private getOrCreateWritableStream(userId: string): Writable {
        if (!this.writableStreamMap.has(userId)) {
            this.initializeWritableStream(userId);
        }

        return this.writableStreamMap.get(userId)!;
    }

    private resetTimer(userId: string): void {
        if (this.pendingTimers.has(userId)) {
            clearTimeout(this.pendingTimers.get(userId)!);
        }

        const timer = setTimeout(() => {
            this.writableStreamMap.get(userId)!.end();
            this.writableStreamMap.delete(userId);
        }, this.timeout);

        this.pendingTimers.set(userId, timer);
    }

    uploadVideoChunk(chunk: Buffer, userId: string): void {
        const stream = this.getOrCreateWritableStream(userId);
        stream.write(chunk);

        this.resetTimer(userId);
    }

    endVideoStream(userId: string): void {
        this.writableStreamMap.get(userId)!.end();
        this.writableStreamMap.delete(userId);
        clearTimeout(this.pendingTimers.get(userId)!);
        this.pendingTimers.delete(userId);
    }
}
