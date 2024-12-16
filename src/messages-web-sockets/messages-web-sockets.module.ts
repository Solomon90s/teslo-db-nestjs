import { Module } from '@nestjs/common';
import { MessagesWebSocketsService } from './messages-web-sockets.service';
import { MessagesWebSocketsGateway } from './messages-web-sockets.gateway';

@Module({
  providers: [MessagesWebSocketsGateway, MessagesWebSocketsService],
})
export class MessagesWebSocketsModule {}
