import { PrismaService } from 'src/modules/prisma/prisma.service';
import { AccountIdPipe } from './account-id.pipe';

describe('AccountIdPipe', () => {
  it('should be defined', () => {
    const prismaService = {} as PrismaService;
    const request = {};
    expect(new AccountIdPipe(prismaService, request)).toBeDefined();
  });
});
