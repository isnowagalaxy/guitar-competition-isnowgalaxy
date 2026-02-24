/**
 * Shai vs Ronald Tracker - Google Apps Script backend
 *
 * Web app contract (used by the frontend):
 * - GET  -> { ok: true, events: [...] }
 * - POST -> body JSON string (text/plain) { events: [...], token?: "...", updatedAt?: "...", source?: "..." }
 *
 * Script Properties (Project Settings > Script properties):
 * - SPREADSHEET_ID   (required)
 * - SHEET_NAME       (optional, default: "events")
 * - WRITE_TOKEN      (optional but recommended)
 * - LOG_SHEET_NAME   (optional, default: "sync_log")
 */

var EVENT_HEADERS = ['id', 'eventDate', 'year', 'player', 'type', 'createdAt', 'source', 'note'];

function doGet(e) {
  try {
    var config = getConfig_();
    // Public read is intentional: anyone with the site link can view the scoreboard.
    // Write operations are protected by token in doPost().

    var eventSheet = getOrCreateSheet_(config.spreadsheet, config.sheetName);
    ensureEventSheetHeader_(eventSheet);
    var events = readEvents_(eventSheet);

    return jsonResponse_({
      ok: true,
      events: events,
      count: events.length,
      source: 'google-sheets',
      sheetName: config.sheetName,
    });
  } catch (error) {
    return jsonResponse_({
      ok: false,
      error: String(error && error.message ? error.message : error),
    });
  }
}

function doPost(e) {
  var lock = LockService.getScriptLock();
  try {
    lock.waitLock(20000);

    var config = getConfig_();
    var payload = parsePostPayload_(e);
    requireToken_(config, payload.token || '');

    var rawEvents = Array.isArray(payload.events) ? payload.events : null;
    if (!rawEvents) {
      throw new Error('POST body must include an events array');
    }

    var normalizedEvents = normalizeEvents_(rawEvents);
    var eventSheet = getOrCreateSheet_(config.spreadsheet, config.sheetName);
    ensureEventSheetHeader_(eventSheet);
    writeEvents_(eventSheet, normalizedEvents);

    logSync_(config, {
      count: normalizedEvents.length,
      updatedAt: payload.updatedAt || '',
      source: payload.source || 'unknown',
    });

    return jsonResponse_({
      ok: true,
      count: normalizedEvents.length,
      source: 'google-sheets',
    });
  } catch (error) {
    return jsonResponse_({
      ok: false,
      error: String(error && error.message ? error.message : error),
    });
  } finally {
    try {
      lock.releaseLock();
    } catch (releaseError) {}
  }
}

function parsePostPayload_(e) {
  var body = '';
  if (e && e.postData && typeof e.postData.contents === 'string') {
    body = e.postData.contents;
  }
  if (!body) {
    throw new Error('Empty POST body');
  }
  try {
    return JSON.parse(body);
  } catch (error) {
    throw new Error('Invalid JSON body');
  }
}

function getConfig_() {
  var props = PropertiesService.getScriptProperties();
  var spreadsheetId = String(props.getProperty('SPREADSHEET_ID') || '').trim();
  if (!spreadsheetId) {
    throw new Error('Missing Script Property: SPREADSHEET_ID');
  }

  var sheetName = String(props.getProperty('SHEET_NAME') || 'events').trim() || 'events';
  var logSheetName = String(props.getProperty('LOG_SHEET_NAME') || 'sync_log').trim() || 'sync_log';
  var writeToken = String(props.getProperty('WRITE_TOKEN') || '').trim();

  return {
    spreadsheet: SpreadsheetApp.openById(spreadsheetId),
    spreadsheetId: spreadsheetId,
    sheetName: sheetName,
    logSheetName: logSheetName,
    writeToken: writeToken,
  };
}

function requireToken_(config, suppliedToken) {
  if (!config.writeToken) return;
  if (String(suppliedToken || '') !== config.writeToken) {
    throw new Error('Unauthorized: invalid token');
  }
}

function getOrCreateSheet_(spreadsheet, name) {
  var sheet = spreadsheet.getSheetByName(name);
  if (!sheet) {
    sheet = spreadsheet.insertSheet(name);
  }
  return sheet;
}

function ensureEventSheetHeader_(sheet) {
  var lastRow = sheet.getLastRow();
  var lastCol = Math.max(sheet.getLastColumn(), EVENT_HEADERS.length);
  if (lastRow === 0) {
    sheet.getRange(1, 1, 1, EVENT_HEADERS.length).setValues([EVENT_HEADERS]);
    return;
  }

  var headerValues = sheet.getRange(1, 1, 1, lastCol).getValues()[0];
  var current = headerValues.slice(0, EVENT_HEADERS.length);
  var matches = true;
  for (var i = 0; i < EVENT_HEADERS.length; i++) {
    if (String(current[i] || '') !== EVENT_HEADERS[i]) {
      matches = false;
      break;
    }
  }
  if (!matches) {
    sheet.getRange(1, 1, 1, EVENT_HEADERS.length).setValues([EVENT_HEADERS]);
  }
}

function readEvents_(sheet) {
  var lastRow = sheet.getLastRow();
  if (lastRow <= 1) return [];

  var data = sheet.getRange(2, 1, lastRow - 1, EVENT_HEADERS.length).getValues();
  var events = [];

  for (var i = 0; i < data.length; i++) {
    var row = data[i];
    var event = {
      id: safeString_(row[0]),
      eventDate: safeString_(row[1]),
      year: safeString_(row[2]),
      player: safeString_(row[3]),
      type: safeString_(row[4]),
      createdAt: safeString_(row[5]),
      source: safeString_(row[6]),
      note: safeString_(row[7]),
    };
    if (!event.id) continue;
    events.push(event);
  }

  events.sort(function (a, b) {
    if (a.eventDate !== b.eventDate) return a.eventDate < b.eventDate ? -1 : 1;
    if (a.createdAt !== b.createdAt) return a.createdAt < b.createdAt ? -1 : 1;
    return a.id < b.id ? -1 : a.id > b.id ? 1 : 0;
  });

  return events;
}

function writeEvents_(sheet, events) {
  sheet.clearContents();
  sheet.getRange(1, 1, 1, EVENT_HEADERS.length).setValues([EVENT_HEADERS]);

  if (!events.length) return;

  var rows = events.map(function (event) {
    return [
      safeString_(event.id),
      safeString_(event.eventDate),
      safeString_(event.year),
      safeString_(event.player),
      safeString_(event.type),
      safeString_(event.createdAt),
      safeString_(event.source),
      safeString_(event.note),
    ];
  });

  sheet.getRange(2, 1, rows.length, EVENT_HEADERS.length).setValues(rows);
}

function normalizeEvents_(rawEvents) {
  var map = {};
  var normalized = [];

  for (var i = 0; i < rawEvents.length; i++) {
    var event = normalizeEvent_(rawEvents[i], i);
    if (map[event.id]) continue;
    map[event.id] = true;
    normalized.push(event);
  }

  normalized.sort(function (a, b) {
    if (a.eventDate !== b.eventDate) return a.eventDate < b.eventDate ? -1 : 1;
    if (a.createdAt !== b.createdAt) return a.createdAt < b.createdAt ? -1 : 1;
    return a.id < b.id ? -1 : a.id > b.id ? 1 : 0;
  });

  return normalized;
}

function normalizeEvent_(raw, index) {
  raw = raw || {};

  var eventDate = safeDateString_(raw.eventDate || raw.date || '');
  var year = safeString_(raw.year || '').slice(0, 4);
  if (!year && eventDate) year = eventDate.slice(0, 4);

  var player = safeString_(raw.player);
  if (player !== 'ronald') player = 'shai';

  var type = safeString_(raw.type);
  if (type !== 'clase' && type !== 'tareaCompletada' && type !== 'tareaTerminada') {
    type = 'clase';
  }

  var id = safeString_(raw.id);
  if (!id) {
    id = 'gas-' + (new Date().getTime()) + '-' + index;
  }

  var createdAt = safeString_(raw.createdAt);
  if (!createdAt) {
    createdAt = eventDate ? eventDate + 'T12:00:00.000Z' : new Date().toISOString();
  }

  return {
    id: id,
    eventDate: eventDate || safeDateString_(new Date().toISOString().slice(0, 10)),
    year: year || String(new Date().getFullYear()),
    player: player,
    type: type,
    createdAt: createdAt,
    source: safeString_(raw.source || 'remote'),
    note: safeString_(raw.note || ''),
  };
}

function safeDateString_(value) {
  var s = safeString_(value);
  return s ? s.slice(0, 10) : '';
}

function safeString_(value) {
  if (value === null || value === undefined) return '';
  return String(value);
}

function logSync_(config, meta) {
  var sheet = getOrCreateSheet_(config.spreadsheet, config.logSheetName);
  if (sheet.getLastRow() === 0) {
    sheet.getRange(1, 1, 1, 5).setValues([['loggedAt', 'count', 'updatedAt', 'source', 'sheetName']]);
  }
  sheet.appendRow([
    new Date().toISOString(),
    Number(meta.count || 0),
    safeString_(meta.updatedAt || ''),
    safeString_(meta.source || ''),
    config.sheetName,
  ]);
}

function jsonResponse_(payload) {
  return ContentService
    .createTextOutput(JSON.stringify(payload))
    .setMimeType(ContentService.MimeType.JSON);
}
