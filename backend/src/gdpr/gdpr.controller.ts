import { Body, Controller, Get, Post, Req, Res, UseGuards } from '@nestjs/common';
import type { Response } from 'express';
import { JwtAuthGuard } from '../auth/guards/jwt.guard';
import { GdprService } from './gdpr.service';

@Controller('gdpr')
export class GdprController {
  constructor(private readonly gdpr: GdprService) {}

  // GET /api/gdpr/export -> downloadable JSON of the authenticated user's data
  @UseGuards(JwtAuthGuard)
  @Get('export')
  async export(@Req() req: any, @Res({ passthrough: true }) res: Response) {
    const data = await this.gdpr.exportData(req.user.id);
    res.setHeader('Content-Type', 'application/json');
    res.setHeader('Content-Disposition', 'attachment; filename="my-data.json"');
    return data;
  }

  // POST /api/gdpr/delete-request -> emails a confirmation token (nothing deleted yet)
  @UseGuards(JwtAuthGuard)
  @Post('delete-request')
  async deleteRequest(@Req() req: any) {
    await this.gdpr.requestDeletion(req.user.id);
    return {
      message: 'A confirmation email has been sent. Use the token it contains to finish deletion.',
    };
  }

  // POST /api/gdpr/delete-confirm -> token-authenticated; performs the deletion
  @Post('delete-confirm')
  confirm(@Body('token') token: string) {
    return this.gdpr.confirmDeletion(token);
  }
}
