import { IsString, IsNotEmpty, IsNumber, IsOptional } from 'class-validator';

export class CreateMessageDto {
  @IsString()
  @IsNotEmpty()
  content!: string;

  // par sécurité, le userId est retiré du body

  @IsString()
  @IsOptional()
  eventId?: string;
}
