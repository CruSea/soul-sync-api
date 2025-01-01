import { Test, TestingModule } from '@nestjs/testing';
import { MessageExchangeService } from './message-exchange.service';

describe('MessageExchangeService', () => {
  let service: MessageExchangeService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [MessageExchangeService],
    }).compile();

    service = module.get<MessageExchangeService>(MessageExchangeService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
