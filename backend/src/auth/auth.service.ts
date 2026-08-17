import { Injectable, UnauthorizedException } from '@nestjs/common';
import { UsersService } from '../users/users.service';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcrypt';

@Injectable()
export class AuthService {
    constructor(
        private usersService: UsersService,
        private jwtService: JwtService,
    ) {}

    async validateUser(email: string, pass: string) {
        const user = await this.usersService.findFromEmail(email);
        if (!user) {
            return null;
        }

        const isPasswordValid = await bcrypt.compare(pass, user.password);
        if (!isPasswordValid) {
            return null;
        }

        const { password, ...result } = user;
        return result; // result contient tout user sauf password
    }

    async login(user: any) {
        const payload = {sub: user.id, email: user.email};
        return {
            access_token: await this.jwtService.signAsync(payload),
        };
    }
}
