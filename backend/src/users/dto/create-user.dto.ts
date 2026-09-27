import { IsEmail } from 'class-validator';
import { IsNewPassword, IsUsername } from './validation-rules';

// classe requise pour le ValidationPipe/class-validator valide ce DTO
// à l'exécution (données venant d'une requête HTTP potentiellement non fiable).
export class CreateLocalUserDto {
  @IsUsername()
  username!: string;

  @IsEmail()
  email!: string;

  @IsNewPassword()
  password!: string;
}

// Interface suffisante ici : objet construit en interne (profil OAuth),
// pas besoin de validation runtime.
export interface CreateOAuthUserDto {
  username: string;
  email: string;
  provider: string;
  providerId: string;
  avatar: string;
  // pas besoin de password
}
