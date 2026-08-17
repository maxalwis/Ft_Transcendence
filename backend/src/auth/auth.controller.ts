import { Controller, Post, UseGuards, Request, HttpCode, HttpStatus } from '@nestjs/common';
import { LocalAuthGuard } from './guards/local-auth.guard';
import { AuthService } from './auth.service';

@Controller('auth')
export class AuthController {
	@UseGuards(LocalAuthGuard)
	@HttpCode(HttpStatus.OK)
	@Post('login')
	async login(@Request() req) {
		return this.
	}
}
