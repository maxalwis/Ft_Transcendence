import { Body, Controller, Get, Post, Req, Res, UseGuards } from '@nestjs/common';
import type { Request, Response } from 'express';
import { JwtAuthGuard } from '../auth/guards/jwt.guard';
import { GdprService } from './gdpr.service';
import { ConfirmDeletionDto } from './dto/confirm-deletion.dto';
import { Throttle } from '@nestjs/throttler';
import { AUTH_THROTTLE } from '../throttler/http-throttler.guard';

@Controller('gdpr')
export class GdprController {
  constructor(private readonly gdpr: GdprService) {}

  // GET /api/gdpr/export -> downloadable JSON of the authenticated user's data
  @UseGuards(JwtAuthGuard)
  @Get('export')
  async export(@Req() req: Request, @Res({ passthrough: true }) res: Response) {
    const data = await this.gdpr.exportData(req.user!.id);
    res.setHeader('Content-Type', 'application/json');
    res.setHeader('Content-Disposition', 'attachment; filename="my-data.json"');
    return data;
  }

  // POST /api/gdpr/delete-request -> emails a confirmation token (nothing deleted yet)
  @UseGuards(JwtAuthGuard)
  @Post('delete-request')
  async deleteRequest(@Req() req: Request) {
    await this.gdpr.requestDeletion(req.user!.id);
    return {
      message: 'A confirmation email has been sent. Use the token it contains to finish deletion.',
    };
  }

  // POST /api/gdpr/delete-confirm -> requires being logged in as the target account,
  // plus the emailed token, plus the password (for password accounts).
  // The route now checks a password: same brute-force budget as login.
  @Throttle(AUTH_THROTTLE)
  @UseGuards(JwtAuthGuard)
  @Post('delete-confirm')
  confirm(@Req() req: Request, @Body() dto: ConfirmDeletionDto) {
    return this.gdpr.confirmDeletion(req.user!.id, dto.token, dto.password);
  }
}
