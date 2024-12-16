import { Test, TestingModule } from '@nestjs/testing';
import { MessagesWebSocketsGateway } from './messages-web-sockets.gateway';
import { MessagesWebSocketsService } from './messages-web-sockets.service';

describe('MessagesWebSocketsGateway', () => {
  let gateway: MessagesWebSocketsGateway;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [MessagesWebSocketsGateway, MessagesWebSocketsService],
    }).compile();

    gateway = module.get<MessagesWebSocketsGateway>(MessagesWebSocketsGateway);
  });

  it('should be defined', () => {
    expect(gateway).toBeDefined();
  });
});
