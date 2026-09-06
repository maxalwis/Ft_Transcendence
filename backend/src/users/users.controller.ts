import {
  Controller,
  Get,
  Post,
  Body,
  Param,
  Put,
  Delete,
  ParseIntPipe,
  Query,
  Req,
  UseGuards,
  UseInterceptors,
  UploadedFile
} from '@nestjs/common';
import { UsersService } from './users.service';
import { JwtAuthGuard } from '../auth/guards/jwt.guard';
import { FileInterceptor } from '@nestjs/platform-express';
import { diskStorage } from 'multer';
import { extname } from 'path';

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
  searchByUsername(@Query('username') name: string, @Req() req: any) {
    const currentUserId = req.user?.id;
    return this.usersService.searchByUsername(name, currentUserId);
  }

  @Get(':id')
  @UseGuards(JwtAuthGuard)
  findOne(@Param('id', ParseIntPipe) id: number) {
    return this.usersService.findOne(id);
  }

  @Put(':id')
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
    })
  )
  update(
    @Param('id', ParseIntPipe) id: number,
    @Body()
    body: {
      username?: string;
      email?: string;
      preferredLanguage?: 'FR' | 'EN' | 'ES';
      preferredCategory?: 'MUSIC' | 'CULTURE' | 'WORKSHOPS' | 'LEISURE' | 'OTHERS';
    },
    @UploadedFile() file?: Express.Multer.File
  ) {
    return this.usersService.update(id, {
      ...body,
      avatar: file ? `/uploads/avatars/${file.filename}` : undefined,
    });
  }

  @Delete(':id')
  @UseGuards(JwtAuthGuard)
  remove(@Param('id', ParseIntPipe) id: number) {
    return this.usersService.remove(id);
  }
}
