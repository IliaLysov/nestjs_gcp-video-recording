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
import * as fs from 'fs';

@WebSocketGateway()
export class VideoGateway implements OnGatewayConnection, OnGatewayDisconnect {
  @WebSocketServer()
  private server: Server;

  private uploadedPartsMap: Map<string, Buffer[]> = new Map();

  constructor(private jwtService: JwtService) {}

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
    this.getOrCreateUploadedParts(client['user'].id).push(part);
    return true;
  }

  @SubscribeMessage('endVideo')
  async handleVideoEndPart(@ConnectedSocket() client: Socket): Promise<void> {
    console.log('endVideo');
    //save video on this event
    const uploadedParts = this.uploadedPartsMap.get(client['user'].id);

    const video = Buffer.concat(uploadedParts);
    fs.writeFile(
      `./uploads/${client['user'].id}_${new Date().toUTCString()}_final.webm`,
      video,
      (err) => {
        if (err) {
          console.log(err);
        } else {
          this.uploadedPartsMap.delete(client['user'].id);
          console.log('video saved');
        }
      },
    );
  }

  @SubscribeMessage('error')
  handleError(@MessageBody() error: string): void {
    console.log(error);
  }

  private getOrCreateUploadedParts(userId: string): Buffer[] {
    if (!this.uploadedPartsMap.has(userId)) {
      this.uploadedPartsMap.set(userId, []);
    }

    return this.uploadedPartsMap.get(userId)!;
  }
}
