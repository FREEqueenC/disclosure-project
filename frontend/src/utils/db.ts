const DB_NAME = 'DisclosureHubDB';
const DB_VERSION = 1;
const STORE_NAME = 'slideDecks';

export interface SlidePage {
  pageNumber: number;
  text: string;
  image?: string; // base64 Data URL (optional for lazy-rendering)
}

export interface SlideDeck {
  id: string;
  name: string;
  uploadedAt: number;
  totalPages: number;
  harmonicSignature: number; // calculated Gematria weight
  colorPalette: string[];    // extracted hex/hsl colors
  entities: string[];        // auto-extracted proper nouns/tags
  quotes: string[];          // key sentences for tickers
  pages: SlidePage[];
  pdfBytes?: ArrayBuffer;    // raw PDF file bytes for lazy rendering
}

export const initDB = (): Promise<IDBDatabase> => {
  return new Promise((resolve, reject) => {
    const request = indexedDB.open(DB_NAME, DB_VERSION);

    request.onerror = () => {
      console.error('Failed to open database:', request.error);
      reject(request.error);
    };

    request.onsuccess = () => {
      resolve(request.result);
    };

    request.onupgradeneeded = (event: IDBVersionChangeEvent) => {
      const db = request.result;
      if (!db.objectStoreNames.contains(STORE_NAME)) {
        db.createObjectStore(STORE_NAME, { keyPath: 'id' });
      }
    };
  });
};

export const saveDeck = async (deck: SlideDeck): Promise<void> => {
  const db = await initDB();
  return new Promise((resolve, reject) => {
    const transaction = db.transaction(STORE_NAME, 'readwrite');
    const store = transaction.objectStore(STORE_NAME);
    const request = store.put(deck);

    request.onsuccess = () => resolve();
    request.onerror = () => reject(request.error);
  });
};

export const getAllDecks = async (): Promise<SlideDeck[]> => {
  const db = await initDB();
  return new Promise((resolve, reject) => {
    const transaction = db.transaction(STORE_NAME, 'readonly');
    const store = transaction.objectStore(STORE_NAME);
    const request = store.getAll();

    request.onsuccess = () => resolve(request.result || []);
    request.onerror = () => reject(request.error);
  });
};

export const deleteDeck = async (id: string): Promise<void> => {
  const db = await initDB();
  return new Promise((resolve, reject) => {
    const transaction = db.transaction(STORE_NAME, 'readwrite');
    const store = transaction.objectStore(STORE_NAME);
    const request = store.delete(id);

    request.onsuccess = () => resolve();
    request.onerror = () => reject(request.error);
  });
};
