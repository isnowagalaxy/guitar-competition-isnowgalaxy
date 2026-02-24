export const APP_START_YEAR = 2020;

export const PLAYER_META = {
  shai: {
    id: 'shai',
    name: 'Shai',
    color: '#0A84FF',
    tint: 'rgba(10,132,255,0.12)',
  },
  ronald: {
    id: 'ronald',
    name: 'Ronald',
    color: '#FF453A',
    tint: 'rgba(255,69,58,0.12)',
  },
};

export const EVENT_TYPE_META = {
  clase: {
    id: 'clase',
    label: 'Llegó a Tiempo',
    shortLabel: 'Tiempo',
  },
  tareaCompletada: {
    id: 'tareaCompletada',
    label: 'Empezó la Tarea',
    shortLabel: 'Empezó',
  },
  tareaTerminada: {
    id: 'tareaTerminada',
    label: 'Terminó la Tarea',
    shortLabel: 'Terminó',
  },
};

export const EVENT_TYPE_IDS = Object.keys(EVENT_TYPE_META);

// Years where the winner is known but detailed event-level tracking is missing.
export const YEAR_OUTCOME_OVERRIDES = {
  '2025': {
    winner: 'ronald',
    note: 'Ronald ganó 2025 (sin tracking semanal/detallado).',
    source: 'manual-user-note',
  },
};

export function getTodayIsoLocal() {
  const now = new Date();
  const yyyy = String(now.getFullYear());
  const mm = String(now.getMonth() + 1).padStart(2, '0');
  const dd = String(now.getDate()).padStart(2, '0');
  return `${yyyy}-${mm}-${dd}`;
}

export function toYearString(value) {
  if (!value) return String(new Date().getFullYear());
  return String(value).slice(0, 4);
}

function fallbackId() {
  return `evt-${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 9)}`;
}

export function generateEventId() {
  if (globalThis.crypto && typeof globalThis.crypto.randomUUID === 'function') {
    return globalThis.crypto.randomUUID();
  }
  return fallbackId();
}

export function createEvent({ player, type, eventDate, source = 'manual', note = '' }) {
  const normalizedDate = eventDate || getTodayIsoLocal();
  return {
    id: generateEventId(),
    player,
    type,
    eventDate: normalizedDate,
    year: toYearString(normalizedDate),
    createdAt: new Date().toISOString(),
    source,
    note,
  };
}

export function normalizeEvent(raw, index = 0) {
  const eventDate = raw?.eventDate || raw?.date || getTodayIsoLocal();
  const player = raw?.player === 'ronald' ? 'ronald' : 'shai';
  const type = EVENT_TYPE_META[raw?.type] ? raw.type : 'clase';
  const id = raw?.id || `legacy-${toYearString(eventDate)}-${index}`;
  const createdAt =
    raw?.createdAt ||
    (typeof eventDate === 'string' && eventDate.length >= 10
      ? `${eventDate.slice(0, 10)}T12:00:00.000Z`
      : new Date().toISOString());

  return {
    id,
    player,
    type,
    eventDate: String(eventDate).slice(0, 10),
    year: String(raw?.year || toYearString(eventDate)),
    createdAt,
    source: raw?.source || 'manual',
    note: raw?.note || '',
  };
}

export function sortEvents(events) {
  return [...events].sort((a, b) => {
    const byDate = a.eventDate.localeCompare(b.eventDate);
    if (byDate !== 0) return byDate;
    const byCreated = (a.createdAt || '').localeCompare(b.createdAt || '');
    if (byCreated !== 0) return byCreated;
    return String(a.id).localeCompare(String(b.id));
  });
}

export function normalizeEvents(rawEvents) {
  const list = Array.isArray(rawEvents) ? rawEvents : [];
  const seen = new Set();
  const normalized = [];

  list.forEach((raw, index) => {
    const event = normalizeEvent(raw, index);
    if (seen.has(event.id)) return;
    seen.add(event.id);
    normalized.push(event);
  });

  return sortEvents(normalized);
}

export function mergeEvents(existingEvents, incomingEvents) {
  const combined = [...normalizeEvents(existingEvents), ...normalizeEvents(incomingEvents)];
  return normalizeEvents(combined);
}

export function calculateYearBreakdown(events, year) {
  const breakdown = {
    shai: {
      clase: 0,
      tareaCompletada: 0,
      tareaTerminada: 0,
    },
    ronald: {
      clase: 0,
      tareaCompletada: 0,
      tareaTerminada: 0,
    },
  };

  events.forEach((event) => {
    if (event.year !== year) return;
    breakdown[event.player][event.type] += 1;
  });

  return breakdown;
}

export function getPlayerTotal(playerBreakdown) {
  return EVENT_TYPE_IDS.reduce((sum, typeId) => sum + (playerBreakdown[typeId] || 0), 0);
}

export function calculateDashboardStats(events, selectedYear) {
  const currentBreakdown = calculateYearBreakdown(events, selectedYear);
  const currentShaiTotal = getPlayerTotal(currentBreakdown.shai);
  const currentRonaldTotal = getPlayerTotal(currentBreakdown.ronald);
  const currentTotal = currentShaiTotal + currentRonaldTotal;

  const years = Array.from(
    new Set([...events.map((event) => event.year), ...Object.keys(YEAR_OUTCOME_OVERRIDES)]),
  ).sort();
  let shaiAllTime = 0;
  let ronaldAllTime = 0;
  let shaiYearsWon = 0;
  let ronaldYearsWon = 0;

  years.forEach((year) => {
    const breakdown = calculateYearBreakdown(events, year);
    const shaiTotal = getPlayerTotal(breakdown.shai);
    const ronaldTotal = getPlayerTotal(breakdown.ronald);
    shaiAllTime += shaiTotal;
    ronaldAllTime += ronaldTotal;
    if (shaiTotal > ronaldTotal) {
      shaiYearsWon += 1;
      return;
    }
    if (ronaldTotal > shaiTotal) {
      ronaldYearsWon += 1;
      return;
    }

    // If totals tie or are missing, allow a manual override for the yearly winner.
    const override = YEAR_OUTCOME_OVERRIDES[year];
    if (override?.winner === 'shai') shaiYearsWon += 1;
    if (override?.winner === 'ronald') ronaldYearsWon += 1;
  });

  return {
    current: {
      breakdown: currentBreakdown,
      shaiTotal: currentShaiTotal,
      ronaldTotal: currentRonaldTotal,
      total: currentTotal,
      shaiPct: currentTotal ? ((currentShaiTotal / currentTotal) * 100).toFixed(1) : '0.0',
      ronaldPct: currentTotal ? ((currentRonaldTotal / currentTotal) * 100).toFixed(1) : '0.0',
      outcomeOverride: YEAR_OUTCOME_OVERRIDES[selectedYear] || null,
    },
    allTime: {
      shaiTotal: shaiAllTime,
      ronaldTotal: ronaldAllTime,
      shaiYearsWon,
      ronaldYearsWon,
    },
  };
}

export function buildChartData(events, selectedYear) {
  const yearEvents = sortEvents(events.filter((event) => event.year === selectedYear));
  if (!yearEvents.length) return [];

  const grouped = new Map();
  yearEvents.forEach((event) => {
    if (!grouped.has(event.eventDate)) {
      grouped.set(event.eventDate, { shai: 0, ronald: 0 });
    }
    const bucket = grouped.get(event.eventDate);
    bucket[event.player] += 1;
  });

  let shaiCumulative = 0;
  let ronaldCumulative = 0;
  return Array.from(grouped.entries()).map(([date, bucket]) => {
    shaiCumulative += bucket.shai;
    ronaldCumulative += bucket.ronald;
    return {
      date,
      shai: shaiCumulative,
      ronald: ronaldCumulative,
    };
  });
}

export function getMonthTicks(chartData, locale = 'es-ES') {
  const ticks = [];
  let previousMonth = '';

  chartData.forEach((item, index) => {
    const label = new Date(`${item.date}T12:00:00`).toLocaleDateString(locale, { month: 'short' });
    if (label !== previousMonth) {
      ticks.push({ index, label });
      previousMonth = label;
    }
  });

  return ticks;
}

export function getYearOptions(events, selectedYear) {
  const currentYear = new Date().getFullYear();
  const years = new Set();

  for (let year = APP_START_YEAR; year <= currentYear + 1; year += 1) {
    years.add(String(year));
  }
  events.forEach((event) => years.add(event.year));
  if (selectedYear) years.add(selectedYear);

  return Array.from(years).sort((a, b) => Number(b) - Number(a));
}

export function getRecentEvents(events, { year = 'all', limit = 40 } = {}) {
  const filtered = year === 'all' ? events : events.filter((event) => event.year === year);
  const ordered = [...filtered].sort((a, b) => {
    const byDate = b.eventDate.localeCompare(a.eventDate);
    if (byDate !== 0) return byDate;
    const byCreated = (b.createdAt || '').localeCompare(a.createdAt || '');
    if (byCreated !== 0) return byCreated;
    return String(b.id).localeCompare(String(a.id));
  });
  return ordered.slice(0, limit);
}

export function formatEventDate(date, locale = 'es-ES') {
  try {
    return new Date(`${date}T12:00:00`).toLocaleDateString(locale, {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    });
  } catch {
    return date;
  }
}

export function downloadJsonFile(filename, payload) {
  const blob = new Blob([JSON.stringify(payload, null, 2)], { type: 'application/json' });
  const url = URL.createObjectURL(blob);
  const anchor = document.createElement('a');
  anchor.href = url;
  anchor.download = filename;
  document.body.appendChild(anchor);
  anchor.click();
  anchor.remove();
  URL.revokeObjectURL(url);
}
