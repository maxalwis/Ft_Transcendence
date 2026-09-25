import { IsEmail, IsEnum, IsOptional, IsString } from 'class-validator';
import { PreferredCategory, PreferredLanguage } from '../../generated/prisma/client';

export class UpdateUserDto {
  @IsOptional()
  @IsString()
  username?: string;

  @IsOptional()
  @IsEmail()
  email?: string;

  @IsOptional()
  @IsEnum(PreferredLanguage)
  preferredLanguage?: PreferredLanguage;

  @IsOptional()
  @IsEnum(PreferredCategory)
  preferredCategory?: PreferredCategory;
}
