import { Test, TestingModule } from '@nestjs/testing';
import { DatabaseConsumerController } from './database-consumer.controller';

describe('DatabaseConsumerController', () => {
  let controller: DatabaseConsumerController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [DatabaseConsumerController],
    }).compile();

    controller = module.get<DatabaseConsumerController>(
      DatabaseConsumerController,
    );
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
