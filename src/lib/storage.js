import { createSeedEvents, SEED_VERSION } from '../data/seedEvents.js';
import { normalizeEvents } from './events.js';

const STORE_KEY = 'svr-tracker-store-v2';
const LEGACY_EVENTS_KEY = 'shai-vs-ronald-events';

function getRemoteConfig(tokenOverride) {
  const envToken = (import.meta.env?.VITE_EVENTS_API_TOKEN || '').trim();
  return {
    url: (import.meta.env?.VITE_EVENTS_API_URL || '').trim(),
    token: typeof tokenOverride === 'string' ? tokenOverride.trim() : envToken,
  };
}

function buildRemoteGetUrl(url, token) {
  if (!token) return url;
  const hasQuery = url.includes('?');
  return `${url}${hasQuery ? '&' : '?'}token=${encodeURIComponent(token)}`;
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

async function tryLoadRemoteEvents(options = {}) {
  const remote = getRemoteConfig(options.tokenOverride);
  if (!remote.url) {
    return { ok: false, skipped: true, reason: 'remote-not-configured' };
  }

  try {
    const response = await fetch(buildRemoteGetUrl(remote.url, remote.token), {
      method: 'GET',
      headers: { Accept: 'application/json' },
      cache: 'no-store',
    });
    if (!response.ok) {
      throw new Error(`HTTP ${response.status}`);
    }
    const payload = await response.json();
    if (payload && payload.ok === false) {
      throw new Error(payload.error || 'Remote GET failed');
    }
    const remoteEvents = Array.isArray(payload) ? payload : payload?.events;
    if (!Array.isArray(remoteEvents)) {
      throw new Error('Remote response must be { events: [...] } or an array');
    }
    return { ok: true, events: normalizeEvents(remoteEvents) };
  } catch (error) {
    return { ok: false, skipped: false, reason: error?.message || 'remote-load-failed' };
  }
}

async function trySaveRemoteEvents(events, options = {}) {
  const remote = getRemoteConfig(options.tokenOverride);
  if (!remote.url) {
    return { ok: false, skipped: true, reason: 'remote-not-configured' };
  }

  try {
    const body = {
      events: normalizeEvents(events),
      updatedAt: new Date().toISOString(),
      source: 'svr-web-prototype',
    };
    if (remote.token) {
      body.token = remote.token;
    }

    const response = await fetch(remote.url, {
      method: 'POST',
      // Intentionally omit Content-Type header so browsers send a simple request
      // (text/plain) and avoid a CORS preflight, which makes Google Apps Script
      // web apps much easier to use as the backend.
      body: JSON.stringify(body),
    });

    if (!response.ok) {
      throw new Error(`HTTP ${response.status}`);
    }

    const maybeJson = await response
      .json()
      .catch(() => ({ ok: true }));
    if (maybeJson && maybeJson.ok === false) {
      throw new Error(maybeJson.error || 'Remote POST failed');
    }

    return { ok: true };
  } catch (error) {
    return { ok: false, skipped: false, reason: error?.message || 'remote-save-failed' };
  }
}

export async function loadEventsSnapshot(options = {}) {
  const localStore = readLocalStore();
  const remoteAttempt = await tryLoadRemoteEvents(options);

  if (remoteAttempt.ok) {
    const mergedEvents = normalizeEvents([...localStore.events, ...remoteAttempt.events]);
    writeLocalStore(mergedEvents);
    return {
      events: mergedEvents,
      storageMode:
        remoteAttempt.events.length === 0 && localStore.events.length > 0 ? 'remote-empty-merged' : 'remote',
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

export async function saveEventsSnapshot(events, options = {}) {
  const localStore = writeLocalStore(events);
  const remoteAttempt = await trySaveRemoteEvents(localStore.events, options);

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
