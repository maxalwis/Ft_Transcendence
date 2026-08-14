import { Injectable, UnauthorizedException } from '@nestjs/common';
import { UsersService } from '../users/users.service';
import * as bcrypt from 'bcrypt';

@Injectable()
export class AuthService {
    constructor(
        private usersService: UsersService,
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
}
