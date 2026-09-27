import {
  Controller,
  Get,
  Body,
  Param,
  Put,
  ParseIntPipe,
  Query,
  Req,
  Res,
  UseGuards,
  UseInterceptors,
  UploadedFile,
  Patch,
  BadRequestException,
} from '@nestjs/common';
import type { Request, Response } from 'express';
import { UsersService } from './users.service';
import { RealtimeEmitterService } from '../realtime/realtime-emitter.service';
import { JwtAuthGuard } from '../auth/guards/jwt.guard';
import { FileInterceptor } from '@nestjs/platform-express';
import { diskStorage } from 'multer';
import { extname } from 'path';
import { UpdateUserDto } from './dto/update-user.dto';
import { ChangePasswordDto } from './dto/change-password.dto';
import { Throttle } from '@nestjs/throttler';
import { AUTH_THROTTLE } from '../throttler/http-throttler.guard';

const ALLOWED_AVATAR_EXTENSIONS = ['.jpg', '.jpeg', '.png', '.webp', '.gif'];

@Controller('users')
export class UsersController {
  constructor(
    private readonly usersService: UsersService,
    private readonly realtimeEmitter: RealtimeEmitterService
  ) {}

  @Get()
  @UseGuards(JwtAuthGuard)
  findAll() {
    return this.usersService.findAll();
  }

  @Get('search')
  @UseGuards(JwtAuthGuard)
  searchByUsername(@Query('username') name: string, @Req() req: Request) {
    return this.usersService.searchByUsername(name, req.user?.id);
  }

  @Get(':id')
  @UseGuards(JwtAuthGuard)
  findOne(@Param('id', ParseIntPipe) id: number) {
    return this.usersService.findOnePublic(id);
  }

  @Patch('password')
  @Throttle(AUTH_THROTTLE)
  @UseGuards(JwtAuthGuard)
  async changePassword(
    @Req() req: Request,
    @Res({ passthrough: true }) res: Response,
    @Body() body: ChangePasswordDto
  ) {
    const userId = req.user!.id;
    const result = await this.usersService.changePassword(
      userId,
      body.currentPassword,
      body.newPassword
    );

    // Les refresh tokens sont révoqués par le service ; on coupe aussi les
    // sockets, authentifiés par un JWT stateless qui resterait sinon valide.
    this.realtimeEmitter.disconnectUser(userId);
    res.clearCookie('refresh_token', { path: '/' });
    return result;
  }

  @Put('me')
  @UseGuards(JwtAuthGuard)
  @UseInterceptors(
    FileInterceptor('avatar', {
      storage: diskStorage({
        destination: './uploads/avatars',
        filename: (req, file, callback) => {
          const uniqueSuffix = `${Date.now()}-${Math.round(Math.random() * 1e9)}`;
          callback(null, `${uniqueSuffix}${extname(file.originalname)}`);
        },
      }),
      limits: { fileSize: 5 * 1024 * 1024 }, // 5 Mo
      fileFilter: (req, file, callback) => {
        const ext = extname(file.originalname).toLowerCase();
        if (!ALLOWED_AVATAR_EXTENSIONS.includes(ext)) {
          return callback(new BadRequestException('Invalid file type'), false);
        }
        callback(null, true);
      },
    })
  )
  async update(
    @Req() req: Request,
    @Body() body: UpdateUserDto,
    @UploadedFile() file?: Express.Multer.File
  ) {
    const user = await this.usersService.update(req.user!.id, {
      ...body,
      avatar: file ? `/uploads/avatars/${file.filename}` : undefined,
    });
    return this.usersService.toPublicUser(user);
  }
}
