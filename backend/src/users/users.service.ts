import { Injectable, NotFoundException, ConflictException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { User, Prisma } from '../generated/prisma/client';

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

  async create(data: { name: string; email: string }): Promise<User> {
    try {
      return await this.prisma.user.create({ data });
    } catch (error) {
      if (error instanceof Prisma.PrismaClientKnownRequestError && error.code === 'P2002') {
        throw new ConflictException('Email address already in use');
      }
      throw error;
    }
  }

  async update(id: number, data: { name?: string; email?: string }): Promise<User> {
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
