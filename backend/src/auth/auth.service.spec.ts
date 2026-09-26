import { Test, TestingModule } from '@nestjs/testing';
import { ConflictException, UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';
import * as bcrypt from 'bcrypt';
import { AuthService } from './auth.service';
import { UsersService } from '../users/users.service';
import { PrismaService } from '../prisma/prisma.service';

jest.mock('bcrypt');

describe('AuthService', () => {
  let service: AuthService;
  let usersServiceMock: any;
  let prismaMock: any;
  let jwtServiceMock: any;
  let configServiceMock: any;

  const mockUser = {
    id: 1,
    email: 'alice@example.com',
    password: 'hashed-password',
  };

  beforeEach(async () => {
    usersServiceMock = {
      findFromEmailOrNull: jest.fn(),
      findFromProviderOrNull: jest.fn(),
      toPublicUser: jest.fn((u) => ({ id: u.id, email: u.email })),
      createOAuth: jest.fn(),
      update: jest.fn(),
      findOne: jest.fn(),
    };

    prismaMock = {
      refreshToken: {
        create: jest.fn(),
        findUnique: jest.fn(),
        updateMany: jest.fn(),
      },
    };

    jwtServiceMock = {
      signAsync: jest.fn(),
      verifyAsync: jest.fn(),
    };

    configServiceMock = {
      get: jest.fn(),
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        AuthService,
        { provide: UsersService, useValue: usersServiceMock },
        { provide: PrismaService, useValue: prismaMock },
        { provide: JwtService, useValue: jwtServiceMock },
        { provide: ConfigService, useValue: configServiceMock },
      ],
    }).compile();

    service = module.get<AuthService>(AuthService);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('validateUser', () => {
    it('should return null if the user does not exist', async () => {
      usersServiceMock.findFromEmailOrNull.mockResolvedValue(null);

      const result = await service.validateUser('nobody@example.com', 'pass');

      expect(result).toBeNull();
    });

    // Un compte OAuth n'a pas de mot de passe local, cf. validateUser().
    it('should return null if the user has no password (OAuth account)', async () => {
      usersServiceMock.findFromEmailOrNull.mockResolvedValue({ ...mockUser, password: null });

      const result = await service.validateUser(mockUser.email, 'pass');

      expect(result).toBeNull();
    });

    it('should return null if the password is invalid', async () => {
      usersServiceMock.findFromEmailOrNull.mockResolvedValue(mockUser);
      (bcrypt.compare as jest.Mock).mockResolvedValue(false);

      const result = await service.validateUser(mockUser.email, 'wrong-pass');

      expect(result).toBeNull();
    });

    it('should return the public user if credentials are valid', async () => {
      usersServiceMock.findFromEmailOrNull.mockResolvedValue(mockUser);
      (bcrypt.compare as jest.Mock).mockResolvedValue(true);

      const result = await service.validateUser(mockUser.email, 'good-pass');

      expect(result).toEqual({ id: mockUser.id, email: mockUser.email });
      expect(usersServiceMock.toPublicUser).toHaveBeenCalledWith(mockUser);
    });
  });

  describe('validateOAuthUser', () => {
    const profile = {
      email: 'alice@gmail.com',
      username: 'alice',
      provider: 'google',
      providerId: 'google-123',
      avatar: 'https://example.com/a.png',
    };

    it('should log in the account matching (provider, providerId)', async () => {
      const oauthUser = { id: 7, email: profile.email, avatar: profile.avatar };
      usersServiceMock.findFromProviderOrNull.mockResolvedValue(oauthUser);

      const result = await service.validateOAuthUser(profile);

      expect(usersServiceMock.findFromProviderOrNull).toHaveBeenCalledWith('google', 'google-123');
      expect(usersServiceMock.findFromEmailOrNull).not.toHaveBeenCalled();
      expect(result).toBe(oauthUser);
    });

    it('should refresh the avatar when the provider sends a new one', async () => {
      usersServiceMock.findFromProviderOrNull.mockResolvedValue({ id: 7, avatar: 'old.png' });
      usersServiceMock.update.mockResolvedValue({ id: 7, avatar: profile.avatar });

      await service.validateOAuthUser(profile);

      expect(usersServiceMock.update).toHaveBeenCalledWith(7, { avatar: profile.avatar });
    });

    it('should never attach an OAuth login to an existing account with the same email', async () => {
      usersServiceMock.findFromProviderOrNull.mockResolvedValue(null);
      usersServiceMock.findFromEmailOrNull.mockResolvedValue({ id: 1, email: profile.email });

      await expect(service.validateOAuthUser(profile)).rejects.toThrow(ConflictException);
      expect(usersServiceMock.createOAuth).not.toHaveBeenCalled();
    });

    it('should create a new account for an unknown provider identity and email', async () => {
      const created = { id: 8, email: profile.email };
      usersServiceMock.findFromProviderOrNull.mockResolvedValue(null);
      usersServiceMock.findFromEmailOrNull.mockResolvedValue(null);
      usersServiceMock.createOAuth.mockResolvedValue(created);

      const result = await service.validateOAuthUser(profile);

      expect(usersServiceMock.createOAuth).toHaveBeenCalledWith(profile);
      expect(result).toBe(created);
    });
  });

  describe('login', () => {
    it('should issue an access token and a refresh token, and persist the refresh token hash', async () => {
      jwtServiceMock.signAsync
        .mockResolvedValueOnce('access-token')
        .mockResolvedValueOnce('refresh-token');
      configServiceMock.get.mockReturnValue('refresh-secret');

      const result = await service.login({ id: mockUser.id, email: mockUser.email });

      expect(result).toEqual({ accessToken: 'access-token', refreshToken: 'refresh-token' });
      expect(prismaMock.refreshToken.create).toHaveBeenCalledWith(
        expect.objectContaining({
          data: expect.objectContaining({ userId: mockUser.id }),
        })
      );
    });
  });

  describe('refreshAccessToken', () => {
    // Le JWT lui-même reste valide jusqu'à expiration, la révocation ne vit qu'en base.
    it('should throw UnauthorizedException if the stored token is revoked', async () => {
      jwtServiceMock.verifyAsync.mockResolvedValue({ sub: mockUser.id, email: mockUser.email });
      prismaMock.refreshToken.findUnique.mockResolvedValue({
        revoked: true,
        expiresAt: new Date(Date.now() + 100000),
      });

      await expect(service.refreshAccessToken('refresh-token')).rejects.toThrow(
        UnauthorizedException
      );
    });

    it('should throw UnauthorizedException if the stored token is expired', async () => {
      jwtServiceMock.verifyAsync.mockResolvedValue({ sub: mockUser.id, email: mockUser.email });
      prismaMock.refreshToken.findUnique.mockResolvedValue({
        revoked: false,
        expiresAt: new Date(Date.now() - 100000),
      });

      await expect(service.refreshAccessToken('refresh-token')).rejects.toThrow(
        UnauthorizedException
      );
    });

    it('should throw UnauthorizedException if jwt verification fails', async () => {
      jwtServiceMock.verifyAsync.mockRejectedValue(new Error('invalid signature'));

      await expect(service.refreshAccessToken('bad-token')).rejects.toThrow(
        UnauthorizedException
      );
    });

    it('should return a new access token when the refresh token is valid', async () => {
      jwtServiceMock.verifyAsync.mockResolvedValue({ sub: mockUser.id, email: mockUser.email });
      prismaMock.refreshToken.findUnique.mockResolvedValue({
        revoked: false,
        expiresAt: new Date(Date.now() + 100000),
      });
      usersServiceMock.findOne.mockResolvedValue(mockUser);
      jwtServiceMock.signAsync.mockResolvedValue('new-access-token');

      const result = await service.refreshAccessToken('refresh-token');

      expect(result.accessToken).toBe('new-access-token');
      expect(usersServiceMock.toPublicUser).toHaveBeenCalledWith(mockUser);
    });
  });

  describe('verifyAccessToken', () => {
    it('should return the decoded payload if the token is valid', async () => {
      jwtServiceMock.verifyAsync.mockResolvedValue({ sub: mockUser.id, email: mockUser.email });

      const result = await service.verifyAccessToken('access-token');

      expect(result).toEqual({ id: mockUser.id, email: mockUser.email });
    });

    it('should throw UnauthorizedException if the token is invalid or expired', async () => {
      jwtServiceMock.verifyAsync.mockRejectedValue(new Error('expired'));

      await expect(service.verifyAccessToken('bad-token')).rejects.toThrow(UnauthorizedException);
    });
  });

  describe('revokeRefreshToken', () => {
    it('should mark the stored refresh token as revoked', async () => {
      await service.revokeRefreshToken('refresh-token');

      expect(prismaMock.refreshToken.updateMany).toHaveBeenCalledWith({
        where: { tokenHash: expect.any(String) },
        data: { revoked: true },
      });
    });
  });

  describe('getUserIdFromRefreshToken', () => {
    it('should return the user id from a valid token', async () => {
      jwtServiceMock.verifyAsync.mockResolvedValue({ sub: mockUser.id });

      const result = await service.getUserIdFromRefreshToken('refresh-token');

      expect(result).toBe(mockUser.id);
    });

    it('should return null if the token cannot be verified', async () => {
      jwtServiceMock.verifyAsync.mockRejectedValue(new Error('invalid'));

      const result = await service.getUserIdFromRefreshToken('bad-token');

      expect(result).toBeNull();
    });
  });
});
