import { JwtService } from '@nestjs/jwt';
import { CreateChannelPipe } from './create.pipe';
import { PrismaService } from 'src/modules/prisma/prisma.service';

describe('CreateChannelPipe', () => {
  it('should be defined', () => {
    const mockPrismaService = {} as PrismaService; // Provide a mock or actual instance of PrismaService
    const mockRequest = { user: { id: 1 } }; // Provide a mock request object with a user
    const mockJwtService = {} as JwtService; // Provide a mock or actual instance of JwtService

    const pipe = new CreateChannelPipe(mockRequest, mockPrismaService, mockJwtService);
    expect(pipe).toBeDefined();
  });
});
