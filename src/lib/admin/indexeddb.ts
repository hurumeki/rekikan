import type { AdminState } from './store';

const DB_NAME = 'rekikan-admin';
const DB_VERSION = 1;
const STORE_NAME = 'state';
const STATE_KEY = 'admin_state';

type StorableState = Omit<AdminState, 'undoStack'>;

function openDB(): Promise<IDBDatabase> {
  return new Promise((resolve, reject) => {
    const request = indexedDB.open(DB_NAME, DB_VERSION);
    request.onupgradeneeded = () => {
      const db = request.result;
      if (!db.objectStoreNames.contains(STORE_NAME)) {
        db.createObjectStore(STORE_NAME);
      }
    };
    request.onsuccess = () => resolve(request.result);
    request.onerror = () => reject(request.error);
  });
}

export async function loadAdminState(): Promise<StorableState | null> {
  if (typeof window === 'undefined') return null;
  try {
    const db = await openDB();
    return new Promise((resolve, reject) => {
      const tx = db.transaction(STORE_NAME, 'readonly');
      const store = tx.objectStore(STORE_NAME);
      const req = store.get(STATE_KEY);
      req.onsuccess = () => resolve(req.result ?? null);
      req.onerror = () => reject(req.error);
    });
  } catch (err) {
    console.error('[rekikan-admin] IndexedDB load failed:', err);
    return null;
  }
}

export async function saveAdminState(state: AdminState): Promise<void> {
  if (typeof window === 'undefined') return;
  try {
    const db = await openDB();
    // Omit undoStack from persisted data to keep storage lean
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const { undoStack: _undoStack, ...storable } = state;
    return new Promise((resolve, reject) => {
      const tx = db.transaction(STORE_NAME, 'readwrite');
      const store = tx.objectStore(STORE_NAME);
      const req = store.put(storable, STATE_KEY);
      req.onsuccess = () => resolve();
      req.onerror = () => reject(req.error);
    });
  } catch (err) {
    console.error('[rekikan-admin] IndexedDB save failed:', err);
  }
}

export async function clearAdminState(): Promise<void> {
  if (typeof window === 'undefined') return;
  try {
    const db = await openDB();
    return new Promise((resolve, reject) => {
      const tx = db.transaction(STORE_NAME, 'readwrite');
      const store = tx.objectStore(STORE_NAME);
      const req = store.delete(STATE_KEY);
      req.onsuccess = () => resolve();
      req.onerror = () => reject(req.error);
    });
  } catch (err) {
    console.error('[rekikan-admin] IndexedDB clear failed:', err);
  }
}
