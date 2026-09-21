import { useState, useEffect } from 'react';
import { useNotification } from '../../../context/notifications/useNotification';
import { useTranslation } from 'react-i18next';

interface TranslatedEvent {
  title: string;
  description: string;
  priceDetail: string;
  category: string;
}

export function useTranslatedEvent(eventId: string, lang: string) {
  const [data, setData] = useState<TranslatedEvent | null>(null);
  const { showWarning } = useNotification();
  const [fetchingId, setFetchingId] = useState<string | null>(null);
  const { t } = useTranslation();

  const isBypassed = !eventId || lang === 'fr';

  useEffect(() => {
    if (isBypassed) return;

    const controller = new AbortController();
    const baseUrl = import.meta.env.VITE_API_URL || 'http://localhost:3000';

    const performFetch = async () => {
      setFetchingId(eventId);
      try {
        const res = await fetch(`${baseUrl}/events/${eventId}?lang=${lang}`, {
          signal: controller.signal,
        });
        if (!res.ok) throw new Error(`Error ${res.status}`);
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
  }, [eventId, lang, isBypassed, showWarning, t]);

  const isLoading = !isBypassed && fetchingId === eventId;

  return {
    data: isBypassed ? null : data,
    loading: isLoading,
  };
}
