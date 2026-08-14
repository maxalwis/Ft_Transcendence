import { Injectable, NotFoundException, ConflictException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { User, Prisma } from '../../generated/prisma/client';
import * as bcrypt from 'bcrypt';

@Injectable()
export class UsersService {
  constructor(private readonly prisma: PrismaService) {}

  async findAll(): Promise<User[]> {
    return this.prisma.user.findMany();
  }

  async findOne(id: number): Promise<User> {
    const user = await this.prisma.user.findUnique({ where: { id } });
    if (!user) {
      throw new NotFoundException(`User with ID ${id} not found`);
    }
    return user;
  }

  async findFromEmail(email: string): Promise<User> {
    const user = await this.prisma.user.findUnique({ where: { email } });
    if (!user)
      throw new NotFoundException(`${email} was not found`);
    return user;
  }

  async findFromUsername(username: string): Promise<User> {
    const user = await this.prisma.user.findUnique({ where: { username } });
    if (!user)
      throw new NotFoundException(`User ${username} was not found`);
    return user;
  }

  async create(data: { username: string; email: string, password: string }): Promise<User> {
    const hashedPassword =  await bcrypt.hash(data.password, 10);
    try {
      return await this.prisma.user.create({ data: { ...data, password: hashedPassword }});
    } catch (error) {
      if (error instanceof Prisma.PrismaClientKnownRequestError && error.code === 'P2002') {
        throw new ConflictException('Email address already in use');
      }
      throw error;
    }
  }

  async update(id: number, data: { username?: string; email?: string }): Promise<User> {
    await this.findOne(id); // Lève une NotFoundException si l'ID n'existe pas

    try {
      return await this.prisma.user.update({
        where: { id },
        data,
      });
    } catch (error) {
      if (error instanceof Prisma.PrismaClientKnownRequestError && error.code === 'P2002') {
        throw new ConflictException('Email address already in use');
      }
      throw error;
    }
  }

  async remove(id: number): Promise<User> {
    await this.findOne(id); // Lève une NotFoundException si l'ID n'existe pas
    return this.prisma.user.delete({ where: { id } });
  }
}
