import { Test, TestingModule } from '@nestjs/testing';
import { ChatExchangeService } from './chat-exchange.service';

describe('ChatExchangeService', () => {
  let service: ChatExchangeService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [ChatExchangeService],
    }).compile();

    service = module.get<ChatExchangeService>(ChatExchangeService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
