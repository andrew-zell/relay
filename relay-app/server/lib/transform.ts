import type { Participant, RelayRecord } from '../../src/types/index.js';

// Known Relay location IDs derived from EBC codes
const LOCATION_MAP: Record<string, string> = {
  sj: 'loc-sj',
  ld: 'loc-ld',
  tk: 'loc-tk',
  sg: 'loc-sg',
};

/**
 * Convert a Janus location_id like "EBC-SJ-01" to a Relay locationId like "loc-sj".
 * Throws if the code is not in the known set.
 */
function mapLocationId(janusLocationId: string): string {
  // Strip leading "EBC-" and trailing "-NN" suffix, lowercase the middle code
  const match = janusLocationId.match(/^EBC-([A-Z]+)-\d+$/i);
  if (!match) {
    throw new Error(`Unrecognised location_id format: ${janusLocationId}`);
  }
  const code = match[1].toLowerCase();
  const locationId = LOCATION_MAP[code];
  if (!locationId) {
    throw new Error(`Unknown EBC location code "${code}" in location_id: ${janusLocationId}`);
  }
  return locationId;
}

/**
 * Convert ISO date "2026-04-07" → "04/07/26"
 */
function formatDate(isoDate: string): string {
  const [year, month, day] = isoDate.split('-');
  const yy = year.slice(2);
  return `${month}/${day}/${yy}`;
}

/**
 * Convert an ISO datetime string "2026-04-07T09:00:00" → "9:00 AM"
 */
function formatTime(isoDateTime: string): string {
  const timePart = isoDateTime.includes('T') ? isoDateTime.split('T')[1] : isoDateTime;
  const [hourStr, minuteStr] = timePart.split(':');
  let hour = parseInt(hourStr, 10);
  const minute = minuteStr ?? '00';
  const period = hour < 12 ? 'AM' : 'PM';
  if (hour === 0) hour = 12;
  else if (hour > 12) hour -= 12;
  return `${hour}:${minute} ${period}`;
}

export interface JanusSession {
  session_id: string;
  sequence: number;
  type: string;
  title: string;
  start_time: string;
  end_time: string;
  display_requirements: Record<string, unknown>;
  screen_layout: unknown;
  content_asset_refs: unknown[];
}

export interface JanusParticipant {
  participant_id: string;
  display_name: string;
  display_title: string;
  company: string;
}

export interface JanusPayload {
  briefing_id: string;
  revision: number;
  account: { name: string };
  opportunity?: { source_opportunity_id?: string; name?: string };
  briefing: {
    date: string;
    location_id: string;
    timezone?: string;
  };
  external_participants?: JanusParticipant[];
  agenda?: { sessions?: JanusSession[] };
  screen_content_request?: Record<string, boolean>;
  briefing_type?: string;
}

export interface TransformResult {
  record: RelayRecord;
  participants: Participant[];
}

export function transformJanusPayload(payload: JanusPayload): TransformResult {
  const locationId = mapLocationId(payload.briefing.location_id);

  // Derive start/end times from agenda sessions
  const sessions: JanusSession[] = payload.agenda?.sessions ?? [];
  let startTime = '9:00 AM';
  let endTime = '5:00 PM';

  if (sessions.length > 0) {
    const sorted = [...sessions].sort(
      (a, b) => new Date(a.start_time).getTime() - new Date(b.start_time).getTime(),
    );
    startTime = formatTime(sorted[0].start_time);
    endTime = formatTime(sorted[sorted.length - 1].end_time);
  }

  const record: RelayRecord = {
    id: payload.briefing_id,
    locationId,
    clientName: payload.account.name.toUpperCase(),
    briefingType: (payload.briefing_type ?? 'EXECUTIVE').toUpperCase(),
    date: formatDate(payload.briefing.date),
    startTime,
    endTime,
  };

  const participants: Participant[] = (payload.external_participants ?? []).map((p) => ({
    id: p.participant_id,
    recordId: payload.briefing_id,
    name: p.display_name.toUpperCase(),
    email: '',
    position: p.display_title,
    company: p.company.toUpperCase(),
  }));

  return { record, participants };
}
