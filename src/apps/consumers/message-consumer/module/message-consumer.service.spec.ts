import { Test, TestingModule } from '@nestjs/testing';
import { MessageConsumerService } from './message-consumer.service';

describe('MessageConsumerService', () => {
  let service: MessageConsumerService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [MessageConsumerService],
    }).compile();

    service = module.get<MessageConsumerService>(MessageConsumerService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
