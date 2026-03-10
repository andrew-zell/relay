import { SENTIMENTO_URL, LOCATION_TO_BRIEFING_CENTER } from '../config/sentimento';
import type { RelayRecord } from '../types';

/** Convert MM/DD/YY string to ISO date string */
function parseMDY(dateStr: string): string {
  const parts = dateStr.split('/');
  if (parts.length !== 3) throw new Error(`Invalid date format: ${dateStr}`);
  const [mm, dd, yy] = parts.map(Number);
  const year = 2000 + yy;
  // Use noon UTC to avoid timezone-driven date shifts
  return new Date(Date.UTC(year, mm - 1, dd, 12, 0, 0)).toISOString();
}

export async function sendRecordToSentimento(record: RelayRecord): Promise<void> {
  const briefingCenterId = LOCATION_TO_BRIEFING_CENTER[record.locationId];
  if (!briefingCenterId) {
    throw new Error(`No Sentimento briefing center mapping for location: ${record.locationId}`);
  }

  const res = await fetch(`${SENTIMENTO_URL}/api/responses/respondent`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'X-Relay-Secret': 'relay-internal',
    },
    body: JSON.stringify({
      name: record.clientName,
      company: record.clientName,
      tourDate: parseMDY(record.date),
      briefingCenterId,
    }),
  });

  if (!res.ok) {
    const text = await res.text().catch(() => res.statusText);
    throw new Error(`Sentimento responded ${res.status}: ${text}`);
  }
}
