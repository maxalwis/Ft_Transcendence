import { useEffect, useState } from 'react';
import { searchEvents, type EventSearchParams, type EventSearchResult } from '../../../api/events';

/*
 * Server-side search for the results sidebar (filters, text search, sort, pagination).
 * The previous page stays displayed while the next one loads, so paging doesn't flash.
 */
export function useEventSearch(params: EventSearchParams, enabled: boolean) {
  const [result, setResult] = useState<EventSearchResult | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(false);

  const { q, city, from, category, price, sort, order, page, limit } = params;

  useEffect(() => {
    if (!enabled) return;

    const controller = new AbortController();

    /* eslint-disable react-hooks/set-state-in-effect */
    setIsLoading(true);
    setError(false);
    /* eslint-enable react-hooks/set-state-in-effect */

    searchEvents({ q, city, from, category, price, sort, order, page, limit }, controller.signal)
      .then((data) => setResult(data))
      .catch(() => {
        if (!controller.signal.aborted) setError(true);
      })
      .finally(() => {
        if (!controller.signal.aborted) setIsLoading(false);
      });

    return () => controller.abort();
  }, [enabled, q, city, from, category, price, sort, order, page, limit]);

  return { result, isLoading, error };
}
