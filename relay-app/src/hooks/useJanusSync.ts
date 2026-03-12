import { useEffect } from 'react';
import { useRelayStore } from '../store/useRelayStore';

const API_SECRET = import.meta.env.VITE_RELAY_API_SECRET as string | undefined;
const POLL_INTERVAL_MS = 30_000;

export function useJanusSync() {
  const hydrateJanusBriefings = useRelayStore((s) => s.hydrateJanusBriefings);

  useEffect(() => {
    async function poll() {
      try {
        const headers: HeadersInit = {};
        if (API_SECRET) headers['X-Janus-Secret'] = API_SECRET;

        const res = await fetch('/relay/briefings', { headers });
        if (!res.ok) return;

        const data = await res.json();
        hydrateJanusBriefings(data);
      } catch {
        // Network error — silently skip, retry on next interval
      }
    }

    poll();
    const id = setInterval(poll, POLL_INTERVAL_MS);
    return () => clearInterval(id);
  }, [hydrateJanusBriefings]);
}
