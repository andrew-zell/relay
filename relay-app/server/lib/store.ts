import type { Participant, RelayRecord } from '../../src/types/index.js';

export interface StoredBriefing {
  briefing_id: string;
  revision: number;
  record: RelayRecord;
  participants: Participant[];
}

export const briefingStore = new Map<string, StoredBriefing>();
