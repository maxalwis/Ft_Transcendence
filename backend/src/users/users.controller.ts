import {
  Controller,
  Get,
  Body,
  Param,
  Put,
  Delete,
  ParseIntPipe,
  Query,
  Req,
  UseGuards,
  UseInterceptors,
  UploadedFile,
  Patch,
  BadRequestException,
} from '@nestjs/common';
import type { Request } from 'express';
import { UsersService } from './users.service';
import { JwtAuthGuard } from '../auth/guards/jwt.guard';
import { FileInterceptor } from '@nestjs/platform-express';
import { diskStorage } from 'multer';
import { extname } from 'path';
import { UpdateUserDto } from './dto/update-user.dto';
import { ChangePasswordDto } from './dto/change-password.dto';

const ALLOWED_AVATAR_EXTENSIONS = ['.jpg', '.jpeg', '.png', '.webp', '.gif'];

@Controller('users')
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

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
  @UseGuards(JwtAuthGuard)
  changePassword(@Req() req: Request, @Body() body: ChangePasswordDto) {
    return this.usersService.changePassword(req.user!.id, body.currentPassword, body.newPassword);
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

  @Delete('me')
  @UseGuards(JwtAuthGuard)
  async remove(@Req() req: Request) {
    const user = await this.usersService.remove(req.user!.id);
    return this.usersService.toPublicUser(user);
  }
}
