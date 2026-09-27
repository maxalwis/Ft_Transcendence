import { applyDecorators } from '@nestjs/common';
import { IsString, Matches, MaxLength, MinLength } from 'class-validator';

export const USERNAME_MIN = 3;
export const USERNAME_MAX = 20;
export const USERNAME_PATTERN = /^[a-zA-Z0-9_-]+$/;

// Règles communes à tous les DTO qui reçoivent un username
export const IsUsername = () =>
  applyDecorators(
    IsString(),
    MinLength(USERNAME_MIN),
    MaxLength(USERNAME_MAX),
    Matches(USERNAME_PATTERN, {
      message: 'username can only contain letters, digits, "_" and "-"',
    })
  );

// bcrypt ignore tout ce qui dépasse 72 octets : au-delà, deux mots de passe
// différents ayant le même début seraient acceptés l'un pour l'autre.
export const IsNewPassword = () => applyDecorators(IsString(), MinLength(8), MaxLength(72));
