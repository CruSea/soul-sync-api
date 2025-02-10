import { Test, TestingModule } from '@nestjs/testing';
import { ChatConsumerController } from './chat-consumer.controller';

describe('ChatConsumerController', () => {
  let controller: ChatConsumerController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [ChatConsumerController],
    }).compile();

    controller = module.get<ChatConsumerController>(ChatConsumerController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
