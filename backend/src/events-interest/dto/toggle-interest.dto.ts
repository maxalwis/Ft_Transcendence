import { IsString, IsNotEmpty } from 'class-validator';

export class ToggleInterestDto {
  @IsString()
  @IsNotEmpty()
  eventId!: string;
}
