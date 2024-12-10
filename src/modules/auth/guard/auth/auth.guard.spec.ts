import { AuthGuard } from './auth.guard';
import { JwtService } from '@nestjs/jwt';

describe('AuthGuard', () => {
  let jwtService: JwtService;

  beforeEach(() => {
    jwtService = new JwtService({ secret: 'test' });
  });

  it('should be defined', () => {
    expect(new AuthGuard(jwtService)).toBeDefined();
  });
});
