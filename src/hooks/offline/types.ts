
export interface OfflineImage {
  id: string;
  storeId: string;
  file: Blob;
  fileName: string;
  previewUrl: string;
  timestamp: number;
  uploaded: boolean;
  meta: {
    uploadedBy?: string;
    originalName?: string;
  };
}

export interface IDBStore {
  db: IDBPDatabase | null;
  isInitialized: boolean;
  initialize: () => Promise<IDBPDatabase | null>;
}

export interface OfflineStatus {
  isOnline: boolean;
  pendingUploads: number;
}
