import { create } from 'zustand';
import type { Element, Location, PlaylistFile, RelayRecord } from '../types';

interface RelayState {
  locations: Location[];
  records: RelayRecord[];
  elements: Element[];

  // UI state
  expandedLocations: Set<string>;
  expandedRecords: Set<string>;
  activeRecordId: string | null;

  // Actions — Locations
  toggleLocation: (locationId: string) => void;

  // Actions — Records
  toggleRecord: (recordId: string) => void;
  setActiveRecord: (recordId: string | null) => void;
  addRecord: (record: Omit<RelayRecord, 'id'>) => void;
  updateRecord: (id: string, updates: Partial<RelayRecord>) => void;
  duplicateRecord: (id: string) => void;
  copyRecordToLocation: (id: string, newLocationId: string) => void;

  // Actions — Elements
  addElement: (element: Omit<Element, 'id'>) => void;
  updateElement: (id: string, updates: Partial<Element>) => void;
  removeElement: (id: string) => void;
  setElementActive: (id: string, isActive: boolean) => void;
  duplicateElement: (id: string) => void;
  addToPlaylist: (elementId: string, file: Omit<PlaylistFile, 'id'>) => void;
  removeFromPlaylist: (elementId: string, fileId: string) => void;
  reorderPlaylist: (elementId: string, fromIdx: number, toIdx: number) => void;
  enterPlaylistMode: (id: string) => void;
  exitPlaylistMode: (id: string) => void;
}

function uid() {
  return Math.random().toString(36).slice(2, 10);
}

const SEED_LOCATIONS: Location[] = [
  { id: 'loc-sj', name: 'SAN JOSE' },
  { id: 'loc-ld', name: 'LONDON' },
  { id: 'loc-tk', name: 'TOKYO' },
  { id: 'loc-sg', name: 'SINGAPORE' },
];

const SEED_RECORDS: RelayRecord[] = [
  {
    id: 'rec-avant',
    locationId: 'loc-sj',
    clientName: 'AVANT',
    briefingType: 'EXECUTIVE',
    date: '03/26/26',
    startTime: '7:00 AM',
    endTime: '3:00 PM',
  },
  {
    id: 'rec-alcoa',
    locationId: 'loc-sj',
    clientName: 'ALCOA',
    briefingType: 'PRODUCT',
    date: '04/10/26',
    startTime: '9:00 AM',
    endTime: '12:00 PM',
  },
  {
    id: 'rec-bain',
    locationId: 'loc-sj',
    clientName: 'BAIN CAPITAL',
    briefingType: 'EXECUTIVE',
    date: '',
    startTime: '',
    endTime: '',
  },
  {
    id: 'rec-cohere',
    locationId: 'loc-sj',
    clientName: 'COHERE',
    briefingType: 'PRODUCT',
    date: '',
    startTime: '',
    endTime: '',
  },
  {
    id: 'rec-telecom',
    locationId: 'loc-sg',
    clientName: 'TELECOM HOLDINGS',
    briefingType: 'EXECUTIVE',
    date: '03/27/26',
    startTime: '10:00 AM',
    endTime: '2:00 PM',
  },
  // A past event for demo purposes
  {
    id: 'rec-zoom',
    locationId: 'loc-sj',
    clientName: 'ZOOM',
    briefingType: 'PRODUCT',
    date: '01/15/26',
    startTime: '9:00 AM',
    endTime: '1:00 PM',
  },
];

const SEED_ELEMENTS: Element[] = [
  {
    id: 'el-1',
    recordId: 'rec-avant',
    type: 'SHOWCASE_INTERIOR',
    isActive: true,
    loop: true,
    playlistMode: false,
    fileName: 'AVANT_DSI.MP4',
    fileUrl: null,
    isVideo: true,
    playlist: [],
  },
  {
    id: 'el-2',
    recordId: 'rec-avant',
    type: 'WELCOME_SCREEN',
    isActive: true,
    loop: false,
    playlistMode: false,
    fileName: 'AVANT_WELCOME.PNG',
    fileUrl: null,
    isVideo: false,
    playlist: [],
  },
  {
    id: 'el-3',
    recordId: 'rec-avant',
    type: 'SHOWCASE_EXTERIOR',
    isActive: false,
    loop: false,
    playlistMode: false,
    fileName: null,
    fileUrl: null,
    isVideo: false,
    playlist: [],
  },
  {
    id: 'el-4',
    recordId: 'rec-avant',
    type: 'PHOTO_OPPORTUNITY',
    isActive: false,
    loop: false,
    playlistMode: false,
    fileName: null,
    fileUrl: null,
    isVideo: false,
    playlist: [],
  },
  {
    id: 'el-5',
    recordId: 'rec-avant',
    type: 'VIGNETTE',
    isActive: false,
    loop: false,
    playlistMode: false,
    fileName: null,
    fileUrl: null,
    isVideo: false,
    playlist: [],
  },
];

export const useRelayStore = create<RelayState>((set) => ({
  locations: SEED_LOCATIONS,
  records: SEED_RECORDS,
  elements: SEED_ELEMENTS,
  expandedLocations: new Set(['loc-sj']),
  expandedRecords: new Set(['rec-avant']),
  activeRecordId: 'rec-avant',

  toggleLocation: (locationId) =>
    set((s) => {
      const next = new Set(s.expandedLocations);
      next.has(locationId) ? next.delete(locationId) : next.add(locationId);
      return { expandedLocations: next };
    }),

  toggleRecord: (recordId) =>
    set((s) => {
      const next = new Set(s.expandedRecords);
      next.has(recordId) ? next.delete(recordId) : next.add(recordId);
      return { expandedRecords: next };
    }),

  setActiveRecord: (recordId) => set({ activeRecordId: recordId }),

  addRecord: (record) =>
    set((s) => ({
      records: [...s.records, { ...record, id: uid() }],
    })),

  updateRecord: (id, updates) =>
    set((s) => ({
      records: s.records.map((r) => (r.id === id ? { ...r, ...updates } : r)),
    })),

  duplicateRecord: (id) =>
    set((s) => {
      const original = s.records.find((r) => r.id === id);
      if (!original) return {};
      const newId = uid();
      const newRecord: RelayRecord = { ...original, id: newId };
      const newElements: Element[] = s.elements
        .filter((el) => el.recordId === id)
        .map((el) => ({
          ...el,
          id: uid(),
          recordId: newId,
          isActive: false,
          playlist: el.playlist.map((f) => ({ ...f, id: uid() })),
        }));
      return {
        records: [...s.records, newRecord],
        elements: [...s.elements, ...newElements],
      };
    }),

  copyRecordToLocation: (id, newLocationId) =>
    set((s) => {
      const original = s.records.find((r) => r.id === id);
      if (!original) return {};
      const newId = uid();
      const newRecord: RelayRecord = { ...original, id: newId, locationId: newLocationId, date: '', startTime: '', endTime: '' };
      const newElements: Element[] = s.elements
        .filter((el) => el.recordId === id)
        .map((el) => ({
          ...el,
          id: uid(),
          recordId: newId,
          isActive: false,
          playlist: el.playlist.map((f) => ({ ...f, id: uid() })),
        }));
      return {
        records: [...s.records, newRecord],
        elements: [...s.elements, ...newElements],
      };
    }),

  addElement: (element) =>
    set((s) => ({
      elements: [...s.elements, { ...element, id: uid() }],
    })),

  updateElement: (id, updates) =>
    set((s) => ({
      elements: s.elements.map((el) => (el.id === id ? { ...el, ...updates } : el)),
    })),

  removeElement: (id) =>
    set((s) => ({ elements: s.elements.filter((el) => el.id !== id) })),

  setElementActive: (id, isActive) =>
    set((s) => {
      const target = s.elements.find((el) => el.id === id);
      if (!target) return {};
      return {
        elements: s.elements.map((el) => {
          if (el.id === id) return { ...el, isActive };
          if (isActive && el.recordId === target.recordId && el.type === target.type) {
            return { ...el, isActive: false };
          }
          return el;
        }),
      };
    }),

  duplicateElement: (id) =>
    set((s) => {
      const original = s.elements.find((el) => el.id === id);
      if (!original) return {};
      const duplicate: Element = {
        ...original,
        id: uid(),
        isActive: false,
        playlist: original.playlist.map((f) => ({ ...f, id: uid() })),
      };
      const idx = s.elements.findIndex((el) => el.id === id);
      const next = [...s.elements];
      next.splice(idx + 1, 0, duplicate);
      return { elements: next };
    }),

  addToPlaylist: (elementId, file) =>
    set((s) => ({
      elements: s.elements.map((el) =>
        el.id === elementId
          ? { ...el, playlist: [...el.playlist, { ...file, id: uid() }] }
          : el
      ),
    })),

  removeFromPlaylist: (elementId, fileId) =>
    set((s) => ({
      elements: s.elements.map((el) =>
        el.id === elementId
          ? { ...el, playlist: el.playlist.filter((f) => f.id !== fileId) }
          : el
      ),
    })),

  reorderPlaylist: (elementId, fromIdx, toIdx) =>
    set((s) => ({
      elements: s.elements.map((el) => {
        if (el.id !== elementId) return el;
        const playlist = [...el.playlist];
        const [item] = playlist.splice(fromIdx, 1);
        playlist.splice(toIdx, 0, item);
        return { ...el, playlist };
      }),
    })),

  enterPlaylistMode: (id) =>
    set((s) => {
      const el = s.elements.find((e) => e.id === id);
      if (!el) return {};
      // Carry existing single file into playlist if not already in playlist mode
      let playlist = [...el.playlist];
      if (!el.playlistMode && el.fileName && el.fileUrl) {
        playlist = [
          { id: uid(), fileName: el.fileName, fileUrl: el.fileUrl, isVideo: el.isVideo },
          ...playlist,
        ];
      }
      return {
        elements: s.elements.map((e) =>
          e.id === id
            ? { ...e, playlistMode: true, playlist, fileName: null, fileUrl: null, isActive: true }
            : e
        ),
      };
    }),

  exitPlaylistMode: (id) =>
    set((s) => ({
      elements: s.elements.map((e) =>
        e.id === id
          ? { ...e, playlistMode: false, playlist: [], fileName: null, fileUrl: null, isVideo: false, isActive: false, loop: false }
          : e
      ),
    })),
}));
