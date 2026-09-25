import { IsString, MinLength } from 'class-validator';

export class ChangePasswordDto {
  @IsString()
  currentPassword!: string;

  @IsString()
//  @MinLength(8) -> à décommenter avant la correction
  newPassword!: string;
}
