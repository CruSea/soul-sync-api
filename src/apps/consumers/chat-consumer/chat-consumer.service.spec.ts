import { Test, TestingModule } from '@nestjs/testing';
import { ChatConsumerService } from './chat-consumer.service';

describe('ChatConsumerService', () => {
  let service: ChatConsumerService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [ChatConsumerService],
    }).compile();

    service = module.get<ChatConsumerService>(ChatConsumerService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
