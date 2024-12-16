import { Test, TestingModule } from '@nestjs/testing';
import { MessagesWebSocketsService } from './messages-web-sockets.service';

describe('MessagesWebSocketsService', () => {
  let service: MessagesWebSocketsService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [MessagesWebSocketsService],
    }).compile();

    service = module.get<MessagesWebSocketsService>(MessagesWebSocketsService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
