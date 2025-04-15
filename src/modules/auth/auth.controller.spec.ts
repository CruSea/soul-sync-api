// auth.controller.spec.ts

import { Test, TestingModule } from '@nestjs/testing';
import { AuthController } from './auth.controller';
import { AuthService } from './auth.service';
import { SignInUserDto } from './dto/sign-in-auth.dto';
import { SignUpUserDto } from './dto/sign-up-auth.dto';
import { AuthDto } from './dto/auth.dto';
import { UserDto } from '../admin/user/dto/user.dto';
import { Response } from 'express';

describe('AuthController', () => {
  let controller: AuthController;

  const mockAuthService = {
    signIn: jest.fn(),
    signUp: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [AuthController],
      providers: [{ provide: AuthService, useValue: mockAuthService }],
    }).compile();

    controller = module.get<AuthController>(AuthController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  describe('signIn', () => {
    it('should return AuthDto on successful sign in', async () => {
      const signInDto: SignInUserDto = {
        email: 'test@example.com',
        password: 'securePass123',
      };

      const user = new UserDto({
        id: '1',
        name: 'Test User',
        email: 'test@example.com',
      });

      const authResult: AuthDto = {
        token: 'mock_token',
        user,
        accounts: [
          {
            id: 'acc-1',
            name: 'Main Account',
            role: { id: 'r1', name: 'OWNER' },
          },
        ],
      };

      mockAuthService.signIn.mockResolvedValue(authResult);

      const result = await controller.signIn(signInDto);
      expect(result).toEqual(authResult);
      expect(mockAuthService.signIn).toHaveBeenCalledWith(signInDto);
    });
  });

  describe('signUp', () => {
    it('should return AuthDto on successful sign up', async () => {
      const signUpDto: SignUpUserDto = {
        email: 'new@example.com',
        password: 'pass123',
        name: 'New User',
      };

      const user = new UserDto({
        id: '2',
        name: 'New User',
        email: 'new@example.com',
      });

      const authResult: AuthDto = {
        token: 'mock_signup_token',
        user,
        accounts: [
          {
            id: 'acc-2',
            name: 'Second Account',
            role: { id: 'r2', name: 'OWNER' },
          },
        ],
      };

      mockAuthService.signUp.mockResolvedValue(authResult);

      const result = await controller.signUp(signUpDto);
      expect(result).toEqual(authResult);
      expect(mockAuthService.signUp).toHaveBeenCalledWith(signUpDto);
    });
  });

  describe('googleAuthRedirect', () => {
    it('should redirect with token for production callback', async () => {
      const req: any = { user: 'mock_google_token' };
      const res: Partial<Response> = {
        redirect: jest.fn(),
      };

      process.env.WEB_CALLBACK_URL = 'https://yourapp.com/callback';

      await controller.googleAuthRedirect(req, res as Response);
      expect(res.redirect).toHaveBeenCalledWith(
        `https://yourapp.com/callback?token=mock_google_token`,
      );
    });
  });

  describe('googleLocalAuthRedirect', () => {
    it('should redirect with token for local callback', async () => {
      const req: any = { user: 'mock_local_token' };
      const res: Partial<Response> = {
        redirect: jest.fn(),
      };

      process.env.LOCAL_WEB_CALLBACK_URL = 'http://localhost:3000/callback';

      await controller.googleLocalAuthRedirect(req, res as Response);
      expect(res.redirect).toHaveBeenCalledWith(
        `http://localhost:3000/callback?token=mock_local_token`,
      );
    });
  });
});
