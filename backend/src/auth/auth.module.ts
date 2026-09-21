import { Module } from '@nestjs/common';
import { JwtModule } from '@nestjs/jwt';
import { PassportModule } from '@nestjs/passport';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { AuthService } from './auth.service';
import { AuthController } from './auth.controller';
import { UsersModule } from '../users/users.module';
import { LocalStrategy } from './strategies/local.strategy';
import { JwtStrategy } from './strategies/jwt.strategy';
import { GoogleStrategy } from './strategies/google.strategy';
import { FortyTwoStrategy } from './strategies/fortytwo.strategy';
import { RealtimeEmitterModule } from '../realtime/realtime-emitter.module';

@Module({
  imports: [
    UsersModule,
    PassportModule,
    ConfigModule,
    RealtimeEmitterModule,
    JwtModule.registerAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: (config: ConfigService) => ({
        secret: config.get<string>('JWT_SECRET'),
        signOptions: { expiresIn: '15m' }, // token validation time
      }),
    }),
  ],
  providers: [AuthService, LocalStrategy, JwtStrategy, GoogleStrategy, FortyTwoStrategy],
  controllers: [AuthController],
  exports: [AuthService],
})
export class AuthModule {}
