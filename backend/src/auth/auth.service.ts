import { Injectable, UnauthorizedException } from '@nestjs/common';
import { UsersService } from '../users/users.service';
import * as bcrypt from 'bcrypt';

@Injectable()
export class AuthService {
    constructor(private usersService: UsersService) {}

    async signIn(username: string, pass: string): Promise<any> {
        const user = await this.usersService.findOne(username);
        if 
    }
}
