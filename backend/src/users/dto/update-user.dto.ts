import { IsEnum, IsOptional } from 'class-validator';
import { PreferredCategory, PreferredLanguage } from '../../generated/prisma/client';
import { IsUsername } from './validation-rules';

// Pas d'email ici : l'email n'étant jamais vérifié, le laisser modifiable
// permettrait de s'approprier l'adresse d'un autre (cf. validateOAuthUser).
// Le ValidationPipe (whitelist) supprime donc tout champ email envoyé.
export class UpdateUserDto {
  @IsOptional()
  @IsUsername()
  username?: string;

  @IsOptional()
  @IsEnum(PreferredLanguage)
  preferredLanguage?: PreferredLanguage;

  @IsOptional()
  @IsEnum(PreferredCategory)
  preferredCategory?: PreferredCategory;
}
