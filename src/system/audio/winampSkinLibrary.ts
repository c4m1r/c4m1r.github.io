const DATABASE_NAME = 'winamp-skins';
const DATABASE_VERSION = 1;
const STORE_NAME = 'skins';
const ACTIVE_SKIN_ID = 'active';

export interface SavedWinampSkin {
  id: string;
  name: string;
  blob: Blob;
  savedAt: number;
}

let databasePromise: Promise<IDBDatabase> | null = null;

function openDatabase(): Promise<IDBDatabase> {
  if (typeof indexedDB === 'undefined') {
    return Promise.reject(new Error('Skin storage is not available in this browser'));
  }
  if (databasePromise) return databasePromise;
  databasePromise = new Promise((resolve, reject) => {
    const request = indexedDB.open(DATABASE_NAME, DATABASE_VERSION);
    request.onupgradeneeded = () => {
      if (!request.result.objectStoreNames.contains(STORE_NAME)) {
        request.result.createObjectStore(STORE_NAME, { keyPath: 'id' });
      }
    };
    request.onsuccess = () => {
      const database = request.result;
      database.onversionchange = () => {
        database.close();
        databasePromise = null;
      };
      resolve(database);
    };
    request.onerror = () => {
      databasePromise = null;
      reject(request.error ?? new Error('Unable to open skin storage'));
    };
  });
  return databasePromise;
}

function waitForTransaction(transaction: IDBTransaction): Promise<void> {
  return new Promise((resolve, reject) => {
    transaction.oncomplete = () => resolve();
    transaction.onerror = () => reject(transaction.error ?? new Error('Skin storage transaction failed'));
    transaction.onabort = () => reject(transaction.error ?? new Error('Skin storage transaction aborted'));
  });
}

export async function saveActiveWinampSkin(name: string, blob: Blob): Promise<void> {
  const database = await openDatabase();
  const transaction = database.transaction(STORE_NAME, 'readwrite');
  const completed = waitForTransaction(transaction);
  transaction.objectStore(STORE_NAME).put({ id: ACTIVE_SKIN_ID, name, blob, savedAt: Date.now() } satisfies SavedWinampSkin);
  await completed;
}

export async function getActiveWinampSkin(): Promise<SavedWinampSkin | null> {
  const database = await openDatabase();
  const transaction = database.transaction(STORE_NAME, 'readonly');
  const completed = waitForTransaction(transaction);
  const request = transaction.objectStore(STORE_NAME).get(ACTIVE_SKIN_ID);
  const record = await new Promise<SavedWinampSkin | null>((resolve, reject) => {
    request.onsuccess = () => resolve((request.result as SavedWinampSkin | undefined) ?? null);
    request.onerror = () => reject(request.error ?? new Error('Unable to read saved skin'));
  });
  await completed;
  return record;
}

export async function clearActiveWinampSkin(): Promise<void> {
  const database = await openDatabase();
  const transaction = database.transaction(STORE_NAME, 'readwrite');
  const completed = waitForTransaction(transaction);
  transaction.objectStore(STORE_NAME).delete(ACTIVE_SKIN_ID);
  await completed;
}
