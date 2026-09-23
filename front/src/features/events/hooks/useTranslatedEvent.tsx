import { useState, useEffect } from 'react';
import { useNotification } from '../../../context/notifications/useNotification';
import { useTranslation } from 'react-i18next';

interface TranslatedEvent {
  title: string;
  description: string;
  priceDetail: string;
  category: string;
}

const normalizeLanguage = (lang: string): 'fr' | 'en' | 'es' | 'ar' => {
  const language = lang.split('-')[0].toLowerCase();

  switch (language) {
    case 'fr':
    case 'en':
    case 'es':
    case 'ar':
      return language;
    default:
      return 'fr';
  }
};

export function useTranslatedEvent(eventId: string, lang: string) {
  const [data, setData] = useState<TranslatedEvent | null>(null);
  const { showWarning } = useNotification();
  const [fetchingId, setFetchingId] = useState<string | null>(null);
  const { t } = useTranslation();

  const apiLang = normalizeLanguage(lang);
  const isBypassed = !eventId || apiLang === 'fr';

  useEffect(() => {
    if (isBypassed) return;

    const controller = new AbortController();
    const baseUrl = import.meta.env.VITE_API_URL || 'http://localhost:3000';

    const performFetch = async () => {
      setFetchingId(eventId);

      try {
        const res = await fetch(
          `${baseUrl}/events/${eventId}?lang=${encodeURIComponent(apiLang)}`,
          {
            signal: controller.signal,
          }
        );

        if (!res.ok) {
          throw new Error(`Error ${res.status}`);
        }

        const json = await res.json();
        setData(json);
      } catch (err: unknown) {
        if (err instanceof Error) {
          if (err.name !== 'AbortError') {
            showWarning(err.message);
          }
        } else {
          showWarning(t('events.errors.loadFailed', 'Error loading the event'));
        }
      } finally {
        if (!controller.signal.aborted) {
          setFetchingId(null);
        }
      }
    };

    performFetch();

    return () => {
      controller.abort();
    };
  }, [eventId, apiLang, isBypassed, showWarning, t]);

  const isLoading = !isBypassed && fetchingId === eventId;

  return {
    data: isBypassed ? null : data,
    loading: isLoading,
  };
}
