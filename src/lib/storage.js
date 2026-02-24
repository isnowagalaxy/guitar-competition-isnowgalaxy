import { createSeedEvents, SEED_VERSION } from '../data/seedEvents.js';
import { normalizeEvents } from './events.js';

const STORE_KEY = 'svr-tracker-store-v2';
const LEGACY_EVENTS_KEY = 'shai-vs-ronald-events';

function getRemoteUrl() {
  return (import.meta.env?.VITE_EVENTS_API_URL || '').trim();
}

function parseJsonSafe(value) {
  try {
    return JSON.parse(value);
  } catch {
    return null;
  }
}

function buildStore(events) {
  return {
    version: 2,
    seedVersion: SEED_VERSION,
    updatedAt: new Date().toISOString(),
    events: normalizeEvents(events),
  };
}

function readLocalStore() {
  if (typeof window === 'undefined') {
    return buildStore(createSeedEvents());
  }

  try {
    const modern = localStorage.getItem(STORE_KEY);
    if (modern) {
      const parsed = parseJsonSafe(modern);
      if (parsed?.events) {
        return buildStore(parsed.events);
      }
    }

    const legacy = localStorage.getItem(LEGACY_EVENTS_KEY);
    if (legacy) {
      const parsed = parseJsonSafe(legacy);
      if (Array.isArray(parsed)) {
        const migrated = buildStore(parsed);
        localStorage.setItem(STORE_KEY, JSON.stringify(migrated));
        return migrated;
      }
    }

    const seeded = buildStore(createSeedEvents());
    localStorage.setItem(STORE_KEY, JSON.stringify(seeded));
    return seeded;
  } catch {
    return buildStore(createSeedEvents());
  }
}

function writeLocalStore(events) {
  const store = buildStore(events);
  if (typeof window !== 'undefined') {
    try {
      localStorage.setItem(STORE_KEY, JSON.stringify(store));
    } catch {
      return store;
    }
  }
  return store;
}

async function tryLoadRemoteEvents() {
  const remoteUrl = getRemoteUrl();
  if (!remoteUrl) {
    return { ok: false, skipped: true, reason: 'remote-not-configured' };
  }

  try {
    const response = await fetch(remoteUrl, {
      method: 'GET',
      headers: { Accept: 'application/json' },
    });
    if (!response.ok) {
      throw new Error(`HTTP ${response.status}`);
    }
    const payload = await response.json();
    const remoteEvents = Array.isArray(payload) ? payload : payload?.events;
    if (!Array.isArray(remoteEvents)) {
      throw new Error('Remote response must be { events: [...] } or an array');
    }
    return { ok: true, events: normalizeEvents(remoteEvents) };
  } catch (error) {
    return { ok: false, skipped: false, reason: error?.message || 'remote-load-failed' };
  }
}

async function trySaveRemoteEvents(events) {
  const remoteUrl = getRemoteUrl();
  if (!remoteUrl) {
    return { ok: false, skipped: true, reason: 'remote-not-configured' };
  }

  try {
    const response = await fetch(remoteUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        events: normalizeEvents(events),
        updatedAt: new Date().toISOString(),
        source: 'svr-web-prototype',
      }),
    });

    if (!response.ok) {
      throw new Error(`HTTP ${response.status}`);
    }

    return { ok: true };
  } catch (error) {
    return { ok: false, skipped: false, reason: error?.message || 'remote-save-failed' };
  }
}

export async function loadEventsSnapshot() {
  const localStore = readLocalStore();
  const remoteAttempt = await tryLoadRemoteEvents();

  if (remoteAttempt.ok) {
    writeLocalStore(remoteAttempt.events);
    return {
      events: remoteAttempt.events,
      storageMode: 'remote',
      remoteConfigured: true,
      remoteError: '',
      seedVersion: SEED_VERSION,
    };
  }

  return {
    events: localStore.events,
    storageMode: remoteAttempt.skipped ? 'local' : 'local-fallback',
    remoteConfigured: !remoteAttempt.skipped,
    remoteError: remoteAttempt.skipped ? '' : remoteAttempt.reason,
    seedVersion: SEED_VERSION,
  };
}

export async function saveEventsSnapshot(events) {
  const localStore = writeLocalStore(events);
  const remoteAttempt = await trySaveRemoteEvents(localStore.events);

  if (remoteAttempt.ok) {
    return {
      events: localStore.events,
      storageMode: 'remote-mirror',
      remoteConfigured: true,
      remoteError: '',
    };
  }

  return {
    events: localStore.events,
    storageMode: remoteAttempt.skipped ? 'local' : 'local-unsynced',
    remoteConfigured: !remoteAttempt.skipped,
    remoteError: remoteAttempt.skipped ? '' : remoteAttempt.reason,
  };
}

function readFileText(file) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(String(reader.result || ''));
    reader.onerror = () => reject(new Error('No se pudo leer el archivo'));
    reader.readAsText(file);
  });
}

export async function importEventsFromJsonFile(file) {
  const text = await readFileText(file);
  const parsed = parseJsonSafe(text);
  const candidateEvents = Array.isArray(parsed) ? parsed : parsed?.events;
  if (!Array.isArray(candidateEvents)) {
    throw new Error('El archivo no contiene una lista de eventos válida');
  }
  return normalizeEvents(candidateEvents);
}
