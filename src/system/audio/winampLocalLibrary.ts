import type { MediaTrack } from '../../apps/mediaplayer/playlist';

const DATABASE_NAME = 'winamp-local-audio';
const DATABASE_VERSION = 2;
const STORE_NAME = 'tracks';

export interface WinampLocalAudioRecord {
  id: string;
  name: string;
  type: string;
  size: number;
  lastModified: number;
  title: string;
  artist: string;
  album?: string;
  trackNumber?: string;
  durationLabel: string;
  addedAt: number;
  blob: Blob;
}

export type RestoredWinampLocalTrack = Omit<MediaTrack, 'src'> & { blob: Blob; addedAt: number };

let databasePromise: Promise<IDBDatabase> | null = null;

function openDatabase(): Promise<IDBDatabase> {
  if (typeof indexedDB === 'undefined') {
    return Promise.reject(new Error('Local audio storage is not available in this browser'));
  }
  if (databasePromise) return databasePromise;

  databasePromise = new Promise((resolve, reject) => {
    const request = indexedDB.open(DATABASE_NAME, DATABASE_VERSION);
    request.onupgradeneeded = () => {
      const database = request.result;
      if (!database.objectStoreNames.contains(STORE_NAME)) {
        const store = database.createObjectStore(STORE_NAME, { keyPath: 'id' });
        store.createIndex('addedAt', 'addedAt', { unique: false });
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
      reject(request.error ?? new Error('Unable to open local audio storage'));
    };
    request.onblocked = () => {
      databasePromise = null;
      reject(new Error('Local audio storage is blocked by another open tab'));
    };
  });

  return databasePromise;
}

function transactionComplete(transaction: IDBTransaction): Promise<void> {
  return new Promise((resolve, reject) => {
    transaction.oncomplete = () => resolve();
    transaction.onerror = () => reject(transaction.error ?? new Error('Local audio storage transaction failed'));
    transaction.onabort = () => reject(transaction.error ?? new Error('Local audio storage transaction was aborted'));
  });
}

export function createWinampLocalAudioId(): string {
  const token = typeof crypto !== 'undefined' && typeof crypto.randomUUID === 'function'
    ? crypto.randomUUID()
    : `${Date.now().toString(36)}-${Math.random().toString(36).slice(2)}`;
  return `local-${token}`;
}

export async function saveWinampLocalAudioFiles(files: File[]): Promise<WinampLocalAudioRecord[]> {
  if (!files.length) return [];
  const database = await openDatabase();
  const transaction = database.transaction(STORE_NAME, 'readwrite');
  const completed = transactionComplete(transaction);
  const store = transaction.objectStore(STORE_NAME);
  const records = files.map((file) => ({
    id: createWinampLocalAudioId(),
    name: file.name,
    type: file.type,
    size: file.size,
    lastModified: file.lastModified,
    title: file.name.replace(/\.[^.]+$/, ''),
    artist: 'Local file',
    durationLabel: '—',
    addedAt: Date.now() + files.indexOf(file),
    blob: file.slice(0, file.size, file.type || 'application/octet-stream'),
  }));
  records.forEach((record) => store.put(record));
  await completed;
  return records;
}

export async function getWinampLocalAudioFiles(): Promise<RestoredWinampLocalTrack[]> {
  const database = await openDatabase();
  const transaction = database.transaction(STORE_NAME, 'readonly');
  const completed = transactionComplete(transaction);
  const request = transaction.objectStore(STORE_NAME).getAll();
  const records = await new Promise<WinampLocalAudioRecord[]>((resolve, reject) => {
    request.onsuccess = () => resolve(request.result as WinampLocalAudioRecord[]);
    request.onerror = () => reject(request.error ?? new Error('Unable to read local audio library'));
  });
  await completed;
  return records
    .sort((a, b) => a.addedAt - b.addedAt)
    .map(({ id, title, artist, album, trackNumber, durationLabel, blob, addedAt }) => ({
      id,
      title,
      artist,
      ...(album ? { album } : {}),
      ...(trackNumber ? { trackNumber } : {}),
      durationLabel,
      blob,
      addedAt,
    }));
}

export async function updateWinampLocalAudioMetadata(id: string, metadata: { title?: string; artist?: string; album?: string; trackNumber?: string; durationLabel?: string }): Promise<void> {
  const database = await openDatabase();
  const transaction = database.transaction(STORE_NAME, 'readwrite');
  const completed = transactionComplete(transaction);
  const store = transaction.objectStore(STORE_NAME);
  const request = store.get(id);
  request.onsuccess = () => {
    const current = request.result as WinampLocalAudioRecord | undefined;
    if (!current) return;
    store.put({
      ...current,
      ...(typeof metadata.title === 'string' ? { title: metadata.title } : {}),
      ...(typeof metadata.artist === 'string' ? { artist: metadata.artist } : {}),
      ...(typeof metadata.album === 'string' ? { album: metadata.album } : {}),
      ...(typeof metadata.trackNumber === 'string' ? { trackNumber: metadata.trackNumber } : {}),
      ...(typeof metadata.durationLabel === 'string' ? { durationLabel: metadata.durationLabel } : {}),
    });
  };
  await completed;
}

export async function deleteWinampLocalAudioFiles(ids: string[]): Promise<void> {
  const localIds = ids.filter((id) => id.startsWith('local-'));
  if (!localIds.length) return;
  const database = await openDatabase();
  const transaction = database.transaction(STORE_NAME, 'readwrite');
  const completed = transactionComplete(transaction);
  const store = transaction.objectStore(STORE_NAME);
  localIds.forEach((id) => store.delete(id));
  await completed;
}

export async function getWinampLocalAudioRecords(): Promise<WinampLocalAudioRecord[]> {
  const database = await openDatabase();
  const transaction = database.transaction(STORE_NAME, 'readonly');
  const completed = transactionComplete(transaction);
  const request = transaction.objectStore(STORE_NAME).getAll();
  const records = await new Promise<WinampLocalAudioRecord[]>((resolve, reject) => {
    request.onsuccess = () => resolve(request.result as WinampLocalAudioRecord[]);
    request.onerror = () => reject(request.error ?? new Error('Unable to read local audio library'));
  });
  await completed;
  return records;
}

export async function importWinampLocalAudioAssets(
  assets: Array<{ path: string; name: string; type: string; lastModified: number; blob: Blob }>,
  metadataByPath: Map<string, { title: string; artist: string; album?: string; trackNumber?: string; durationLabel: string }>,
): Promise<Array<{ path: string; record: WinampLocalAudioRecord }>> {
  if (!assets.length) return [];
  const database = await openDatabase();
  const records = assets.map((asset, index) => {
    const metadata = metadataByPath.get(asset.path);
    return {
      id: createWinampLocalAudioId(),
      name: asset.name,
      type: asset.type || 'application/octet-stream',
      size: asset.blob.size,
      lastModified: asset.lastModified,
      title: metadata?.title || asset.name.replace(/\.[^.]+$/, ''),
      artist: metadata?.artist || 'Local file',
      ...(metadata?.album ? { album: metadata.album } : {}),
      ...(metadata?.trackNumber ? { trackNumber: metadata.trackNumber } : {}),
      durationLabel: metadata?.durationLabel || '—',
      addedAt: Date.now() + index,
      blob: asset.blob,
    } satisfies WinampLocalAudioRecord;
  });
  const transaction = database.transaction(STORE_NAME, 'readwrite');
  const completed = transactionComplete(transaction);
  const store = transaction.objectStore(STORE_NAME);
  try {
    records.forEach((record) => store.add(record));
    await completed;
  } catch (error) {
    try { transaction.abort(); } catch { /* The transaction may already have aborted or completed. */ }
    await completed.catch(() => undefined);
    throw error;
  }
  return assets.map((asset, index) => ({ path: asset.path, record: records[index] }));
}
