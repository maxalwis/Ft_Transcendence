import { useState, useEffect } from 'react';

interface TranslatedEvent {
  title: string;
  description: string;
  priceDetail: string;
  category: string;
}

export function useTranslatedEvent(eventId: string, lang: string) {
  const [data, setData] = useState<TranslatedEvent | null>(null);
  const [error, setError] = useState<string | null>(null);

  // Track active fetch state key to derive loading & reset state during render
  const [requestKey, setRequestKey] = useState(`${eventId}:${lang}`);
  const currentKey = `${eventId}:${lang}`;

  // Synchronously reset state during render whenever eventId or lang changes
  if (currentKey !== requestKey) {
    setRequestKey(currentKey);
    setData(null);
    setError(null);
  }

  const isFetching = Boolean(eventId) && (currentKey !== requestKey || (!data && !error));

  useEffect(() => {
    if (!eventId) return;

    let cancelled = false;

    const baseUrl = import.meta.env.VITE_API_URL || 'http://localhost:3000';

    fetch(`${baseUrl}/events/${eventId}?lang=${lang}`)
      .then((res) => {
        if (!res.ok) throw new Error(`Erreur ${res.status}`);
        return res.json();
      })
      .then((json) => {
        if (!cancelled) {
          setData(json);
          setError(null);
        }
      })
      .catch((err) => {
        if (!cancelled) {
          setError(err.message || 'Error loading event');
        }
      });

    return () => {
      cancelled = true;
    };
  }, [eventId, lang]);

  return {
    data: eventId ? data : null,
    loading: eventId ? isFetching : false,
    error: eventId ? error : null,
  };
}
