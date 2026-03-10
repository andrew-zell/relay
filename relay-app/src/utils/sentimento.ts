import { SENTIMENTO_URL, LOCATION_TO_BRIEFING_CENTER } from '../config/sentimento';
import type { Participant, RelayRecord } from '../types';

/** Convert MM/DD/YY string to ISO date string */
function parseMDY(dateStr: string): string {
  const parts = dateStr.split('/');
  if (parts.length !== 3) throw new Error(`Invalid date format: ${dateStr}`);
  const [mm, dd, yy] = parts.map(Number);
  const year = 2000 + yy;
  // Use noon UTC to avoid timezone-driven date shifts
  return new Date(Date.UTC(year, mm - 1, dd, 12, 0, 0)).toISOString();
}

async function postRespondent(payload: object): Promise<void> {
  const res = await fetch(`${SENTIMENTO_URL}/api/responses/respondent`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'X-Relay-Secret': 'relay-internal',
    },
    body: JSON.stringify(payload),
  });

  if (!res.ok) {
    const text = await res.text().catch(() => res.statusText);
    throw new Error(`Sentimento responded ${res.status}: ${text}`);
  }
}

/**
 * Send a briefing record to Sentimento.
 * If participants are provided, one respondent is created per participant.
 * If the list is empty, falls back to a single record-level respondent using clientName.
 */
export async function sendRecordToSentimento(
  record: RelayRecord,
  participants: Participant[] = [],
): Promise<void> {
  const briefingCenterId = LOCATION_TO_BRIEFING_CENTER[record.locationId];
  if (!briefingCenterId) {
    throw new Error(`No Sentimento briefing center mapping for location: ${record.locationId}`);
  }

  const tourDate = parseMDY(record.date);

  if (participants.length === 0) {
    // Legacy fallback: single respondent using the client name
    await postRespondent({
      name: record.clientName,
      company: record.clientName,
      tourDate,
      briefingCenterId,
    });
    return;
  }

  // Send all participants in parallel
  await Promise.all(
    participants.map((p) =>
      postRespondent({
        name: p.name,
        company: p.company || record.clientName,
        position: p.position || undefined,
        email: p.email || undefined,
        tourDate,
        briefingCenterId,
      }),
    ),
  );
}
