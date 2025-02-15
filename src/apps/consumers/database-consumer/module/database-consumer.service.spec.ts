import { Test, TestingModule } from '@nestjs/testing';
import { DatabaseConsumerService } from './database-consumer.service';

describe('DatabaseConsumerService', () => {
  let service: DatabaseConsumerService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [DatabaseConsumerService],
    }).compile();

    service = module.get<DatabaseConsumerService>(DatabaseConsumerService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
