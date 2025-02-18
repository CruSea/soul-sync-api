import { Test, TestingModule } from '@nestjs/testing';
import { MessageConsumerController } from './message-consumer.controller';

describe('MessageConsumerController', () => {
  let controller: MessageConsumerController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [MessageConsumerController],
    }).compile();

    controller = module.get<MessageConsumerController>(MessageConsumerController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
