import { JwtService } from '@nestjs/jwt';
import { WsGuardGuard } from './ws-guard.guard';

describe('WsGuardGuard', () => {
  it('should be defined', () => {
    const jwtService = {} as JwtService;
    expect(new WsGuardGuard(jwtService)).toBeDefined();
  });
});
