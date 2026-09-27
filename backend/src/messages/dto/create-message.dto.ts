import { IsString, IsNotEmpty, IsOptional, MaxLength } from 'class-validator';
import { Transform } from 'class-transformer';

// Même limite que le maxLength du champ côté front (MessageInput.tsx)
export const MESSAGE_MAX = 150;

export class CreateMessageDto {
  // trim avant validation : un message fait uniquement d'espaces devient ""
  // et est rejeté par @IsNotEmpty
  @Transform(({ value }) => (typeof value === 'string' ? value.trim() : value))
  @IsString()
  @IsNotEmpty()
  @MaxLength(MESSAGE_MAX)
  content!: string;

  // par sécurité, le userId est retiré du body

  @IsString()
  @IsOptional()
  eventId?: string;
}
