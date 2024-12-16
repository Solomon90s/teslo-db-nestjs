import { OnGatewayConnection, OnGatewayDisconnect, WebSocketGateway } from '@nestjs/websockets';
import { MessagesWebSocketsService } from './messages-web-sockets.service';
import { Socket } from 'socket.io';

@WebSocketGateway({ cors: true })
export class MessagesWebSocketsGateway implements OnGatewayConnection, OnGatewayDisconnect {
  constructor(
    private readonly messagesWebSocketsService: MessagesWebSocketsService
  ) {}
  handleConnection(client: Socket) {
    this.messagesWebSocketsService.registerClient(client);
  }
  handleDisconnect(client: Socket) {
    this.messagesWebSocketsService.removeClient(client.id);
  }
}
