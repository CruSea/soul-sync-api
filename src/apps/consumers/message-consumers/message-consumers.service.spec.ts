import { Test, TestingModule } from '@nestjs/testing';
import { MessageConsumersService } from './message-consumers.service';

describe('MessageConsumersService', () => {
  let service: MessageConsumersService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [MessageConsumersService],
    }).compile();

    service = module.get<MessageConsumersService>(MessageConsumersService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
