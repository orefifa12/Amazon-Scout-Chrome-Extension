export interface Session {
  id: string;
  name: string;
  status: 'active' | 'completed';
  createdAt: number;
}

export type ListingStatus = 'green' | 'red' | 'gray' | null;

export interface Listing {
  asin: string;
  sessionId: string;
  status: ListingStatus;
  note: string;
  updatedAt: number;
  title?: string;
  url?: string;
}

export interface StorageData {
  sessions: Session[];
  activeSessionId: string | null;
  listings: Record<string, Listing>;
}