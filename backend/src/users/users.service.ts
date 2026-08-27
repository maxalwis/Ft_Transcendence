import { Injectable, NotFoundException, ConflictException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { User, Prisma } from '../generated/prisma/client';
import * as bcrypt from 'bcrypt';
import { CreateLocalUserDto, CreateOAuthUserDto } from './dto/create-user.dto';

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

  // throw si absent quand absence est une erreur ( GET /users/:email par ex)
  async findFromEmail(email: string): Promise<User> {
    const user = await this.prisma.user.findUnique({ where: { email } });
    if (!user) throw new NotFoundException(`${email} was not found`);
    return user;
  }

  // renvoie null si absent : quand c'est un cas normal à gérer (OAuth principalement)
  async findFromEmailOrNull(email: string): Promise<User | null> {
    return this.prisma.user.findUnique({ where: { email } });
  }

  // throw si absent quand absence est une erreur ( GET /users/:id par ex)
  async findFromUsername(username: string): Promise<User> {
    const user = await this.prisma.user.findUnique({ where: { username } });
    if (!user) throw new NotFoundException(`User ${username} was not found`);
    return user;
  }
  // renvoie null si absent : quand c'est un cas normal à gérer (OAuth principalement)
  async findFromUsernameOrNull(username: string): Promise<User | null> {
    return this.prisma.user.findUnique({ where: { username } });
  }

  // fonction pour chercher les users à ajouter dans la liste d'amis
  // exclut le user qui fait la recherche de la liste
  async searchByUsername(query: string, excludeUserId?: number): Promise<User[]> {
    return this.prisma.user.findMany({
      where: {
        username: {
          contains: query,
          mode: 'insensitive', // recherche insensible à la casse
        },
        ...(excludeUserId && { id: { not: excludeUserId } }),
      },
      take: 20, // renvoie 20 users max
    });
  }

  async createLocal(data: CreateLocalUserDto): Promise<User> {
    const hashedPassword = await bcrypt.hash(data.password, 10);
    return this.catchDuplicateError(() =>
      this.prisma.user.create({ data: { ...data, password: hashedPassword } })
    );
  }

  async createOAuth(data: CreateOAuthUserDto): Promise<User> {
    const uniqueUsername = await this.generateUniqueUsername(data.username);
    return this.catchDuplicateError(() =>
      this.prisma.user.create({ data: { ...data, username: uniqueUsername, password: null } })
    );
  }

  // génère un username pour l'OAuth en cas de username déjà existant (sleroy1, sleroy2 etc)
  private async generateUniqueUsername(base: string): Promise<string> {
    let username = base;
    let counter = 1;

    while (await this.findFromUsernameOrNull(username)) {
      username = `${base}${counter}`; // chiffre ajouté seulement si le username existe déjà
      counter++;
    }

    return username;
  }

  async update(id: number, data: { username?: string; email?: string }): Promise<User> {
    await this.findOne(id); // Lève une NotFoundException si l'ID n'existe pas
    return this.catchDuplicateError(() => this.prisma.user.update({ where: { id }, data }));
  }

  async remove(id: number): Promise<User> {
    await this.findOne(id); // Lève une NotFoundException si l'ID n'existe pas
    return this.prisma.user.delete({ where: { id } });
  }

  // Factorise le try/catch P2002 commun à createLocal, createOAuth et update
  private async catchDuplicateError<T>(fn: () => Promise<T>): Promise<T> {
    try {
      return await fn();
    } catch (error) {
      if (error instanceof Prisma.PrismaClientKnownRequestError && error.code === 'P2002') {
        throw new ConflictException('Email address already in use');
      }
      throw error;
    }
  }
}
