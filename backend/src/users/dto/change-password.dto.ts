import { IsString } from 'class-validator';
import { IsNewPassword } from './validation-rules';

export class ChangePasswordDto {
  @IsString()
  currentPassword!: string;

  @IsNewPassword()
  newPassword!: string;
}
