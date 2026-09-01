import { PartialType } from '@nestjs/swagger';
import { CreateEventDto } from './create-event.dto';

// All fields optional for PUT/PATCH-style updates.
export class UpdateEventDto extends PartialType(CreateEventDto) {}
