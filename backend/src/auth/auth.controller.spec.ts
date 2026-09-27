import { Test, TestingModule } from '@nestjs/testing';
import { UnauthorizedException } from '@nestjs/common';
import { AuthController } from './auth.controller';
import { AuthService } from './auth.service';
import { UsersService } from '../users/users.service';
import { RealtimeEmitterService } from '../realtime/realtime-emitter.service';

describe('AuthController', () => {
  let controller: AuthController;
  let authServiceMock: any;
  let usersServiceMock: any;
  let emitterMock: any;

  const mockRes = () => {
    const res: any = {};
    res.cookie = jest.fn().mockReturnValue(res);
    res.clearCookie = jest.fn().mockReturnValue(res);
    res.redirect = jest.fn().mockReturnValue(res);
    return res;
  };

  beforeEach(async () => {
    authServiceMock = {
      login: jest.fn(),
      refreshAccessToken: jest.fn(),
      getUserIdFromRefreshToken: jest.fn(),
      revokeRefreshToken: jest.fn(),
    };
    usersServiceMock = {
      createLocal: jest.fn(),
      toPublicUser: jest.fn(),
    };
    emitterMock = {
      disconnectUser: jest.fn(),
    };

    const module: TestingModule = await Test.createTestingModule({
      controllers: [AuthController],
      providers: [
        { provide: AuthService, useValue: authServiceMock },
        { provide: UsersService, useValue: usersServiceMock },
        { provide: RealtimeEmitterService, useValue: emitterMock },
      ],
    }).compile();

    controller = module.get<AuthController>(AuthController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  describe('register', () => {
    it('should create the user, log them in and set the refresh token cookie', async () => {
      const user = { id: 1, email: 'alice@example.com' };
      usersServiceMock.createLocal.mockResolvedValue(user);
      authServiceMock.login.mockResolvedValue({
        accessToken: 'access',
        refreshToken: 'refresh',
      });
      usersServiceMock.toPublicUser.mockReturnValue({ id: 1, email: 'alice@example.com' });
      const res = mockRes();

      const result = await controller.register(
        { email: 'alice@example.com', password: 'pw' } as any,
        res
      );

      expect(res.cookie).toHaveBeenCalledWith(
        'refresh_token',
        'refresh',
        expect.objectContaining({ httpOnly: true })
      );
      expect(result).toEqual({ accessToken: 'access', user: { id: 1, email: 'alice@example.com' } });
    });
  });

  describe('login', () => {
    it('should throw UnauthorizedException if the local guard did not attach a user', async () => {
      const req = { user: undefined } as any;

      await expect(controller.login(req, mockRes())).rejects.toThrow(UnauthorizedException);
    });

    it('should log in the authenticated user and set the refresh token cookie', async () => {
      const req = { user: { id: 1, email: 'alice@example.com' } } as any;
      authServiceMock.login.mockResolvedValue({ accessToken: 'access', refreshToken: 'refresh' });
      const res = mockRes();

      const result = await controller.login(req, res);

      expect(res.cookie).toHaveBeenCalledWith('refresh_token', 'refresh', expect.any(Object));
      expect(result).toEqual({ accessToken: 'access', user: req.user });
    });
  });

  describe('refresh', () => {
    it('should report unauthenticated when there is no refresh cookie', async () => {
      const req = { cookies: {} } as any;

      const result = await controller.refresh(req);

      expect(result).toEqual({ authenticated: false });
    });

    // Le refresh token invalide/expiré ne doit pas remonter d'erreur au client,
    // juste un statut "non authentifié" (cf. commentaire dans le controller).
    it('should report unauthenticated without throwing if the refresh token is invalid', async () => {
      const req = { cookies: { refresh_token: 'bad-token' } } as any;
      authServiceMock.refreshAccessToken.mockRejectedValue(new UnauthorizedException());

      const result = await controller.refresh(req);

      expect(result).toEqual({ authenticated: false });
    });

    it('should return a fresh access token when the refresh token is valid', async () => {
      const req = { cookies: { refresh_token: 'good-token' } } as any;
      authServiceMock.refreshAccessToken.mockResolvedValue({
        accessToken: 'new-access',
        user: { id: 1 },
      });

      const result = await controller.refresh(req);

      expect(result).toEqual({ authenticated: true, accessToken: 'new-access', user: { id: 1 } });
    });
  });

  describe('logout', () => {
    it('should do nothing beyond clearing the cookie when there is no refresh token', async () => {
      const req = { cookies: {} } as any;
      const res = mockRes();

      await controller.logout(req, res);

      expect(authServiceMock.revokeRefreshToken).not.toHaveBeenCalled();
      expect(res.clearCookie).toHaveBeenCalledWith('refresh_token', { path: '/' });
    });

    it('should revoke the token and disconnect the user sockets', async () => {
      const req = { cookies: { refresh_token: 'token' } } as any;
      const res = mockRes();
      authServiceMock.getUserIdFromRefreshToken.mockResolvedValue(1);

      await controller.logout(req, res);

      expect(authServiceMock.revokeRefreshToken).toHaveBeenCalledWith('token');
      expect(emitterMock.disconnectUser).toHaveBeenCalledWith(1);
    });
  });
});
