import { Injectable } from '@nestjs/common';
import * as fs from 'fs';

@Injectable()
export class VideoService {
  private uploadedPartsMap: Map<string, Express.Multer.File[]> = new Map();
  private joinTimerMap: Map<string, NodeJS.Timeout> = new Map();
  private joinTimeout = 10000; // 10 seconds

  uploadVideo(video: Express.Multer.File, user: any): string {
    const uploadedParts = this.getOrCreateUploadedParts(user.id);
    uploadedParts.push(video);
    this.resetJoinTimer(user.id);

    return 'Video part uploaded';
  }

  private joinVideoParts(uploadedParts: Express.Multer.File[], userId: string) {
    // Assuming parts are sorted by filename (part-1.webm, part-2.webm, etc.)
    const sortedParts = uploadedParts.sort((a, b) => {
      const regex = /part-(\d+)\.webm/;
      const indexA = parseInt(regex.exec(a.originalname)[1]);
      const indexB = parseInt(regex.exec(b.originalname)[1]);
      return indexA - indexB;
    });

    console.log(sortedParts);
    // Combine all parts into one file
    const finalFilePath = `./uploads/${userId}-final.webm`;
    sortedParts.forEach((part) => {
      fs.appendFileSync(finalFilePath, fs.readFileSync(part.path));
    });

    // Delete all parts
    sortedParts.forEach((part) => {
      fs.unlinkSync(part.path);
    });

    this.uploadedPartsMap.delete(userId);

    console.log('Video parts joined and saved to', finalFilePath);
  }

  private resetJoinTimer(userId: string) {
    if (this.joinTimerMap.has(userId)) {
      clearTimeout(this.joinTimerMap.get(userId)!);
    }

    const joinTimer = setTimeout(() => {
      const uploadedParts = this.uploadedPartsMap.get(userId);
      if (uploadedParts) {
        this.joinVideoParts(uploadedParts, userId);
      }
    }, this.joinTimeout);

    this.joinTimerMap.set(userId, joinTimer);
  }

  // private clearJoinTimer(userId: string) {
  //   if (this.joinTimerMap.has(userId)) {
  //     clearTimeout(this.joinTimerMap.get(userId)!);
  //     this.joinTimerMap.delete(userId);
  //   }
  // }

  private getOrCreateUploadedParts(userId: string): Express.Multer.File[] {
    if (!this.uploadedPartsMap.has(userId)) {
      this.uploadedPartsMap.set(userId, []);
    }

    return this.uploadedPartsMap.get(userId)!;
  }

  // private uploadToObjectStorage() {}
}
