import { IsString, IsNotEmpty, IsNumber, IsOptional } from 'class-validator';
import { Type } from 'class-transformer';

export class CreateMessageDto {
  @IsString()
  @IsNotEmpty()
  content!: string;

  @IsNumber()
  @Type(() => Number)
  @IsNotEmpty()
  userId!: number;

  @IsString()
  @IsOptional()
  eventId?: string;
}
