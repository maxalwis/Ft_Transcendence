import { IsString, IsNotEmpty } from 'class-validator';

export class ConfirmDeletionDto {
  @IsString()
  @IsNotEmpty()
  token!: string;
}
