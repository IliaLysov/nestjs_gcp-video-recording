import { Bucket, Storage } from '@google-cloud/storage';
import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';

@Injectable()
export class GcsService {
  private readonly storage: Storage;
  private readonly bucket: Bucket;
  constructor(private configService: ConfigService) {
    this.storage = new Storage({
      projectId: this.configService.get('GCS_PROJECT_ID'),
      keyFilename: this.configService.get('GCS_SERVICE_ACCOUNT_KEY_FILE'),
    });
    this.bucket = this.storage.bucket(
      this.configService.get('GCS_BUCKET_NAME'),
    );
  }

  async uploadFile(filePath: string) {
    await this.bucket.upload(filePath);
    console.log(`${filePath} uploaded to ${this.bucket.name}.`);
  }
}
