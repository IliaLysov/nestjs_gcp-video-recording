import { Injectable } from '@nestjs/common';
import * as fs from 'fs';

@Injectable()
export class VideoService {
  private uploadedParts: Express.Multer.File[] = [];
  private joinTimer: NodeJS.Timeout | null = null;
  private joinTimeout = 10000; // 10 seconds

  uploadVideo(video: Express.Multer.File, done: boolean): string {
    this.uploadedParts.push(video);

    if (done) {
      this.clearJoinTimer();
      this.joinVideoParts();
      return 'Video uploaded';
    } else {
      console.log('Video part saved to', video.path);
      this.resetJoinTimer();
    }

    return 'Video part uploaded';
  }

  private joinVideoParts() {
    // Assuming parts are sorted by filename (part-1.webm, part-2.webm, etc.)
    const sortedParts = this.uploadedParts.sort((a, b) => {
      const regex = /part-(\d+)\.webm/;
      const indexA = parseInt(regex.exec(a.originalname)[1]);
      const indexB = parseInt(regex.exec(b.originalname)[1]);
      return indexA - indexB;
    });

    // Combine all parts into one file
    const finalFilePath = './uploads/final.webm';
    sortedParts.forEach((part) => {
      fs.appendFileSync(finalFilePath, fs.readFileSync(part.path));
    });

    // Delete all parts
    sortedParts.forEach((part) => {
      fs.unlinkSync(part.path);
    });

    this.uploadedParts = [];

    console.log('Video parts joined and saved to', finalFilePath);
  }

  private resetJoinTimer() {
    if (this.joinTimer) {
      clearTimeout(this.joinTimer);
    }

    this.joinTimer = setTimeout(() => {
      this.joinVideoParts();
    }, this.joinTimeout);
  }

  private clearJoinTimer() {
    if (this.joinTimer) {
      clearTimeout(this.joinTimer);
      this.joinTimer = null;
    }
  }
}
