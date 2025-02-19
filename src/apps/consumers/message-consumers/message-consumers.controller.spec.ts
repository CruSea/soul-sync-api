import { Test, TestingModule } from '@nestjs/testing';
import { MessageConsumersController } from './message-consumers.controller';

describe('MessageConsumersController', () => {
  let controller: MessageConsumersController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [MessageConsumersController],
    }).compile();

    controller = module.get<MessageConsumersController>(MessageConsumersController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
