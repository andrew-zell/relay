// Sentimento integration config
// Override with VITE_SENTIMENTO_URL in .env.local for local dev pointing at localhost
export const SENTIMENTO_URL =
  (import.meta.env.VITE_SENTIMENTO_URL as string | undefined) ?? 'https://sentimento-app.fly.dev';

// Relay locationId → Sentimento BriefingCenter integer ID
// Verified against https://sentimento-app.fly.dev/api/briefing-centers
// SJ=1, LD=2, TK=3, SG=4
export const LOCATION_TO_BRIEFING_CENTER: Record<string, number> = {
  'loc-sj': 1, // San Jose
  'loc-ld': 2, // London
  'loc-tk': 3, // Tokyo
  'loc-sg': 4, // Singapore
};
