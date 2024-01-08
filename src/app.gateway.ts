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
import { AuthService } from 'src/auth/auth.service';
import { GcsService } from 'src/gcs/gcs.service';
import { getAccessTokenFromCookie } from 'src/utils/token';

@WebSocketGateway()
export class AppGateway implements OnGatewayConnection, OnGatewayDisconnect {
    @WebSocketServer()
    private server: Server;

    constructor(
        private authService: AuthService,
        private gcsService: GcsService,
    ) {}

    handleConnection(client: Socket) {
        const cookie = client.handshake.headers.cookie;
        const accessToken = getAccessTokenFromCookie(cookie);
        const user = this.authService.verifyAccessToken(accessToken);
        if (!user) client.disconnect();
        client['user'] = user;
        console.log(`client ${user.email} connected`);
    }

    handleDisconnect(client: Socket) {
        console.log(`client ${client['user'].email} disconnected`);
    }

    @SubscribeMessage('videoPart')
    async handleVideoPart(
        @MessageBody() { count, data }: { count: number; data: Buffer },
        @ConnectedSocket() client: Socket,
    ): Promise<boolean> {
        console.log(
            client['user'].email,
            count,
            'videoPart',
            data.length,
            'bytes',
        );
        const maxSize = 100000;
        if (data.length > maxSize) {
            console.error('part too big');
            return false;
        }
        this.gcsService.uploadVideoChunk(data, client['user']);
        return true;
    }

    @SubscribeMessage('endVideo')
    async handleVideoEndPart(@ConnectedSocket() client: Socket): Promise<void> {
        this.gcsService.endVideoStream(client['user']);
        console.log(`${client['user'].email} video saved`);
    }
}
