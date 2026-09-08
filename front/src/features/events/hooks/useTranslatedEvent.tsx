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
  const [loading, setLoading] = useState<boolean>(false);

  useEffect(() => {
    // If no event is hovered or language is default 'fr', skip translation API call
    if (!eventId || lang === 'fr') {
      setData(null);
      setError(null);
      setLoading(false);
      return;
    }

    const controller = new AbortController();
    const baseUrl = import.meta.env.VITE_API_URL || 'http://localhost:3000';

    setLoading(true);

    fetch(`${baseUrl}/events/${eventId}?lang=${lang}`, {
      signal: controller.signal,
    })
      .then((res) => {
        if (!res.ok) throw new Error(`Error ${res.status}`);
        return res.json();
      })
      .then((json) => {
        setData(json);
        setError(null);
        setLoading(false);
      })
      .catch((err) => {
        if (err.name !== 'AbortError') {
          setError(err.message || 'Error loading event');
          setLoading(false);
        }
      });

    // Cancel HTTP request when hovering away or onto another marker
    return () => {
      controller.abort();
    };
  }, [eventId, lang]);

  return {
    data: eventId && lang !== 'fr' ? data : null,
    loading: eventId && lang !== 'fr' ? loading : false,
    error,
  };
}