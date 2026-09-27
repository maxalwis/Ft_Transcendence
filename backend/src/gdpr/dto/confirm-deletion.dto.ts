import { IsNotEmpty, IsOptional, IsString } from 'class-validator';

export class ConfirmDeletionDto {
  @IsString()
  @IsNotEmpty()
  token!: string;

  // Required for password accounts; omitted for OAuth accounts (which have no password).
  @IsOptional()
  @IsString()
  password?: string;
}
