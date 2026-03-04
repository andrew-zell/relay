export type ElementType =
  | 'SHOWCASE_INTERIOR'
  | 'SHOWCASE_EXTERIOR'
  | 'WELCOME_SCREEN'
  | 'PHOTO_OPPORTUNITY'
  | 'VIGNETTE';

export const ELEMENT_TYPE_LABELS: Record<ElementType, string> = {
  SHOWCASE_INTERIOR: 'SHOWCASE INTERIOR',
  SHOWCASE_EXTERIOR: 'SHOWCASE EXTERIOR',
  WELCOME_SCREEN: 'WELCOME SCREEN',
  PHOTO_OPPORTUNITY: 'PHOTO OPPORTUNITY',
  VIGNETTE: 'VIGNETTE',
};

export const ALL_ELEMENT_TYPES: ElementType[] = [
  'SHOWCASE_INTERIOR',
  'SHOWCASE_EXTERIOR',
  'WELCOME_SCREEN',
  'PHOTO_OPPORTUNITY',
  'VIGNETTE',
];

export interface Location {
  id: string;
  name: string;
}

export interface RelayRecord {
  id: string;
  locationId: string;
  clientName: string;
  briefingType: string;
  date: string;
  startTime: string;
  endTime: string;
}

export interface PlaylistFile {
  id: string;
  fileName: string;
  fileUrl: string;
  isVideo: boolean;
}

export interface Element {
  id: string;
  recordId: string;
  type: ElementType;
  isActive: boolean;
  loop: boolean;
  playlistMode: boolean;
  // Single file (when playlistMode is false)
  fileName: string | null;
  fileUrl: string | null;
  isVideo: boolean;
  // Ordered playlist (when playlistMode is true)
  playlist: PlaylistFile[];
}

