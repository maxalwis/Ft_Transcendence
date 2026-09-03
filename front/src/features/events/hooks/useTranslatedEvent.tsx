import { useState, useEffect } from 'react';

interface TranslatedEvent {
  title: string;
  description: string;
  priceDetail: string;
  category: string;
}

export function useTranslatedEvent(eventId: string, lang: string) {
  const [data, setData] = useState<TranslatedEvent | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!eventId) {
      setData(null);
      setLoading(false);
      return;
    }

    let cancelled = false;
    setLoading(true);
    setError(null);

    const baseUrl = import.meta.env.VITE_API_URL || 'http://localhost:3000';

    fetch(`${baseUrl}/events/${eventId}?lang=${lang}`)
      .then((res) => {
        if (!res.ok) throw new Error(`Erreur ${res.status}`);
        return res.json();
      })
      .then((json) => {
        if (!cancelled) setData(json);
      })
      .catch((err) => {
        if (!cancelled) setError(err.message);
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });

    return () => {
      cancelled = true;
    };
  }, [eventId, lang]);

  return { data, loading, error };
}
