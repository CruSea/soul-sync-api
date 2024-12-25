import { Test, TestingModule } from '@nestjs/testing';
import { NegaritService } from './negarit.service';

describe('NegaritService', () => {
  let service: NegaritService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [NegaritService],
    }).compile();

    service = module.get<NegaritService>(NegaritService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
