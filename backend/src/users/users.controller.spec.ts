import { Test, TestingModule } from '@nestjs/testing';
import { UsersController } from './users.controller';
import { UsersService } from './users.service';

describe('UsersController', () => {
  let controller: UsersController;
  let usersServiceMock: any;
  const dbUser = { id: 7, username: 'bob', password: 'bcrypt-hash' };

  beforeEach(async () => {
    usersServiceMock = {
      findAll: jest.fn(),
      findOnePublic: jest.fn(),
      searchByUsername: jest.fn(),
      changePassword: jest.fn(),
      update: jest.fn().mockResolvedValue(dbUser),
      remove: jest.fn().mockResolvedValue(dbUser),
      toPublicUser: jest.fn(({ password, ...publicUser }) => publicUser),
    };

    const module: TestingModule = await Test.createTestingModule({
      controllers: [UsersController],
      providers: [{ provide: UsersService, useValue: usersServiceMock }],
    }).compile();

    controller = module.get<UsersController>(UsersController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  it('findOne should delegate to usersService.findOnePublic', async () => {
    usersServiceMock.findOnePublic.mockResolvedValue({ id: 1, name: 'Alice' });

    const result = await controller.findOne(1);

    expect(usersServiceMock.findOnePublic).toHaveBeenCalledWith(1);
    expect(result).toEqual({ id: 1, name: 'Alice' });
  });

  it('searchByUsername should pass the requester id so results can exclude them', async () => {
    const req = { user: { id: 7 } } as any;
    usersServiceMock.searchByUsername.mockResolvedValue([]);

    await controller.searchByUsername('ali', req);

    expect(usersServiceMock.searchByUsername).toHaveBeenCalledWith('ali', 7);
  });

  it('changePassword should use the authenticated user id, not a client-supplied one', async () => {
    const req = { user: { id: 7 } } as any;

    await controller.changePassword(req, { currentPassword: 'old', newPassword: 'new' } as any);

    expect(usersServiceMock.changePassword).toHaveBeenCalledWith(7, 'old', 'new');
  });

  it('update should build the avatar path from the uploaded file when present', async () => {
    const req = { user: { id: 7 } } as any;
    const file = { filename: 'abc123.png' } as Express.Multer.File;

    await controller.update(req, { name: 'Bob' } as any, file);

    expect(usersServiceMock.update).toHaveBeenCalledWith(7, {
      name: 'Bob',
      avatar: '/uploads/avatars/abc123.png',
    });
  });

  it('update should leave avatar undefined when no file is uploaded', async () => {
    const req = { user: { id: 7 } } as any;

    await controller.update(req, { name: 'Bob' } as any, undefined);

    expect(usersServiceMock.update).toHaveBeenCalledWith(7, { name: 'Bob', avatar: undefined });
  });

  it('update should never return the password hash', async () => {
    const req = { user: { id: 7 } } as any;

    const result = await controller.update(req, {} as any, undefined);

    expect(result).not.toHaveProperty('password');
  });

  it('remove should delete the authenticated user, not an arbitrary id', async () => {
    const req = { user: { id: 7 } } as any;

    await controller.remove(req);

    expect(usersServiceMock.remove).toHaveBeenCalledWith(7);
  });

  it('remove should never return the password hash', async () => {
    const req = { user: { id: 7 } } as any;

    const result = await controller.remove(req);

    expect(result).not.toHaveProperty('password');
  });
});
