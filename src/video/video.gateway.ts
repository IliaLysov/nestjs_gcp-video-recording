import { JwtService } from '@nestjs/jwt';
import {
  ConnectedSocket,
  MessageBody,
  OnGatewayConnection,
  OnGatewayDisconnect,
  SubscribeMessage,
  WebSocketGateway,
  WebSocketServer,
} from '@nestjs/websockets';
import { Server, Socket } from 'socket.io';
// import * as fs from 'fs';
import { ConfigService } from '@nestjs/config';
import { Bucket, Storage } from '@google-cloud/storage';
import { Writable } from 'stream';

@WebSocketGateway()
export class VideoGateway implements OnGatewayConnection, OnGatewayDisconnect {
  @WebSocketServer()
  private server: Server;

  // private uploadedPartsMap: Map<string, Buffer[]> = new Map();

  private readonly storage: Storage;
  private readonly bucket: Bucket;

  private readonly timeout: number = 30000; // the time after which the stream will be closed

  private writableStreamMap: Map<string, Writable> = new Map();
  private pendingTimers: Map<string, NodeJS.Timeout> = new Map();

  constructor(
    private jwtService: JwtService,
    private configService: ConfigService,
  ) {
    this.storage = new Storage({
      projectId: this.configService.get('GCS_PROJECT_ID'),
      keyFilename: this.configService.get('GCS_SERVICE_ACCOUNT_KEY_FILE'),
    });
    this.bucket = this.storage.bucket(
      this.configService.get('GCS_BUCKET_NAME'),
    );
  }

  private getOrCreateWritableStream(userId: string): Writable {
    if (!this.writableStreamMap.has(userId)) {
      this.initializeWritableStream(userId);
      console.log(`stream for ${userId} initialized`);
    }

    return this.writableStreamMap.get(userId)!;
  }

  private initializeWritableStream(userId: string): void {
    const fileName = `${userId}_${new Date().toUTCString()}.webm`;
    const file = this.bucket.file(fileName);
    const stream = file.createWriteStream({
      resumable: false,
      gzip: true,
      metadata: {
        contentType: 'video/webm',
      },
    });
    this.writableStreamMap.set(userId, stream);
  }

  private resetTimer(userId: string): void {
    if (this.pendingTimers.has(userId)) {
      clearTimeout(this.pendingTimers.get(userId)!);
    }

    const timer = setTimeout(() => {
      this.writableStreamMap.get(userId)!.end();
      this.writableStreamMap.delete(userId);
      console.log(`stream for ${userId} ended`);
    }, this.timeout);

    this.pendingTimers.set(userId, timer);
  }

  // private getOrCreateUploadedParts(userId: string): Buffer[] {
  //   if (!this.uploadedPartsMap.has(userId)) {
  //     this.uploadedPartsMap.set(userId, []);
  //   }

  //   return this.uploadedPartsMap.get(userId)!;
  // }

  private verifyAccessToken(
    accessToken: string,
  ): { id: string; email: string } | null {
    try {
      const { sub: id, email } = this.jwtService.verify(accessToken);
      return { id, email };
    } catch (error) {
      return null;
    }
  }
  // private videoParts: Buffer[] = [];

  handleConnection(client: Socket) {
    const cookie = client.handshake.headers.cookie;
    const accessToken = cookie
      .split(';')
      .find((c) => c.trim().startsWith('accessToken='))
      .split('=')[1];
    const user = this.verifyAccessToken(accessToken);
    if (!user) client.disconnect();
    client['user'] = user;
    console.log(`client ${user.email} connected`);
  }

  handleDisconnect(client: Socket) {
    //only timer to save video
    console.log(`client ${client['user'].email} disconnected`);
  }

  // @UseGuards(JwtAuthGuard)
  @SubscribeMessage('videoPart')
  async handleVideoPart(
    @MessageBody() { count, part }: any,
    @ConnectedSocket() client: Socket,
  ): Promise<boolean> {
    console.log(client['user']);
    console.log('videoPart', count);
    this.getOrCreateWritableStream(client['user'].id).write(part);
    this.resetTimer(client['user'].id);
    // this.getOrCreateUploadedParts(client['user'].id).push(part);
    return true;
  }

  @SubscribeMessage('endVideo')
  async handleVideoEndPart(@ConnectedSocket() client: Socket): Promise<void> {
    console.log('endVideo');
    this.writableStreamMap.get(client['user'].id)!.end();
    this.writableStreamMap.delete(client['user'].id);
    this.pendingTimers.delete(client['user'].id);
    console.log('video saved');

    //save video on this event
    // const uploadedParts = this.uploadedPartsMap.get(client['user'].id);

    // const video = Buffer.concat(uploadedParts);
    // fs.writeFile(
    //   `./uploads/${client['user'].id}_${new Date().toUTCString()}_final.webm`,
    //   video,
    //   (err) => {
    //     if (err) {
    //       console.log(err);
    //     } else {
    //       this.uploadedPartsMap.delete(client['user'].id);
    //       console.log('video saved');
    //     }
    //   },
    // );
  }

  @SubscribeMessage('error')
  handleError(@MessageBody() error: string): void {
    console.log(error);
  }
}
