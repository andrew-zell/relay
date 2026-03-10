// Sentimento integration config
// VITE_SENTIMENTO_URL should be set in .env.local for dev and as a Fly secret for production
export const SENTIMENTO_URL =
  (import.meta.env.VITE_SENTIMENTO_URL as string | undefined) ?? 'http://localhost:3001';

// Maps Relay locationId → Sentimento BriefingCenter integer ID
// Confirm IDs against Sentimento's seeded DB before deploying
export const LOCATION_TO_BRIEFING_CENTER: Record<string, number> = {
  'loc-sj': 1,
  'loc-ld': 2,
  'loc-tk': 3,
  'loc-sg': 4,
};
