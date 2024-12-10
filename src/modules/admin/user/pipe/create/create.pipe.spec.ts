import { PrismaService } from 'src/modules/prisma/prisma.service';
import { CreatePipe } from './create.pipe';

describe('CreatePipe', () => {
  it('should be defined', () => {
    const prismaService = {} as PrismaService;
    const request = {};
    expect(new CreatePipe(prismaService, request)).toBeDefined();
  });
});
