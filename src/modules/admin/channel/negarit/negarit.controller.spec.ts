import { Test, TestingModule } from '@nestjs/testing';
import { NegaritController } from './negarit.controller';

describe('NegaritController', () => {
  let controller: NegaritController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [NegaritController],
    }).compile();

    controller = module.get<NegaritController>(NegaritController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
