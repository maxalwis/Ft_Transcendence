import { useCallback } from 'react';
import { useTranslation } from 'react-i18next';

/*
 * The api/*.ts wrappers throw language-neutral codes (Error.message = 'FRIEND_REQUEST_EXISTS'...),
 * never user-facing text. This turns a caught error into a translated message: codes that
 * carry a useful reason get their own text, anything else shows the caller's fallback.
 */
export function useApiErrorMessage() {
  const { t } = useTranslation();

  return useCallback(
    (err: unknown, fallback: string): string => {
      const code = err instanceof Error ? err.message : '';

      switch (code) {
        case 'TOO_MANY_ATTEMPTS':
          return t('errors.tooManyAttempts');
        case 'FRIEND_REQUEST_EXISTS':
          return t('errors.friendRequestExists');
        case 'FRIEND_REQUEST_SELF':
          return t('errors.friendRequestSelf');
        case 'USER_NOT_FOUND':
          return t('errors.userNotFound');
        case 'USERNAME_TAKEN':
          return t('errors.usernameTaken');
        default:
          return fallback;
      }
    },
    [t]
  );
}
