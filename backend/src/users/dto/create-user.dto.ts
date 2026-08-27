import { IsEmail, IsString, IsOptional, MinLength } from 'class-validator';

// classe requise pour le ValidationPipe/class-validator valide ce DTO
// à l'exécution (données venant d'une requête HTTP potentiellement non fiable).
// Verif plus poussée pour email??
export class CreateLocalUserDto {
  @IsString()
  username!: string;

  @IsEmail()
  email!: string;

  @IsString()
  password!: string;
}

// Interface suffisante ici : objet construit en interne (profil OAuth),
// pas besoin de validation runtime.
export interface CreateOAuthUserDto {
  username: string;
  email: string;
  provider: string;
  providerId: string;
  // pas besoin de password
}
