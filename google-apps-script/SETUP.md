# Google Sheets Backend Setup (Apps Script)

This turns your Google Sheet into the shared database for the app.

## What this gives you

- The website reads events from Google Sheets (`GET`)
- The website writes updates back to Google Sheets (`POST`)
- Multiple devices can stay in sync (phone + laptop)
- Google Sheets remains your database / source of truth

## 1) Reuse your existing Google Sheet (recommended)

Use the **same spreadsheet** where your old 2023/2024 data lives.

That keeps everything in one place and avoids duplicating history.

We will **not** overwrite the old tabs. We will add a new tab (for example `events`) for the app's normalized event database.

You do **not** need to create columns manually; the script can create them.

## 2) Open Apps Script

In the Google Sheet:

1. `Extensions` -> `Apps Script`
2. Replace the default file contents with `Code.gs` from this folder:

- `/Users/shai/Documents/dev/2026/shai-vs-ronald-guitar-competition/google-apps-script/Code.gs`

## 3) Set Script Properties (important)

In Apps Script:

1. `Project Settings`
2. `Script Properties`
3. Add:

- `SPREADSHEET_ID` = your Google Sheet ID
- `SHEET_NAME` = `events` (or `svr_events` if you want to keep it extra explicit)
- `LOG_SHEET_NAME` = `sync_log` (optional)
- `WRITE_TOKEN` = a random secret string (recommended)

Example token:

- `svr_2026_private_sync_token_abc123`

## 4) Deploy as Web App

In Apps Script:

1. Click `Deploy` -> `New deployment`
2. Type: `Web app`
3. Execute as: `Me`
4. Who has access: `Anyone` (or `Anyone with Google account` if you prefer and it works for your use case)
5. Deploy
6. Copy the Web App URL

## 5) Connect the frontend (local + Vercel)

Create `.env.local` in the project root:

```bash
VITE_EVENTS_API_URL=PASTE_YOUR_APPS_SCRIPT_WEB_APP_URL_HERE
VITE_EVENTS_API_TOKEN=PASTE_THE_WRITE_TOKEN_HERE
```

For Vercel:

1. Project -> `Settings` -> `Environment Variables`
2. Add the same two variables:
   - `VITE_EVENTS_API_URL`
   - `VITE_EVENTS_API_TOKEN`
3. Redeploy

## 6) How sync behaves

- On page load, the app tries to read from the remote endpoint first.
- If remote fails, it falls back to local storage.
- If remote is empty but local has data (seed/history), the app preserves local data and lets you push it with `Sync ahora`.
- On save, it always writes local first, then attempts remote sync.

## Data format in the sheet

Each row is one event:

- `id`
- `eventDate`
- `year`
- `player`
- `type`
- `createdAt`
- `source`
- `note`

This is why the app can show history by year and recompute charts.

## Notes / gotchas

- The frontend sends POST as a simple request (`text/plain` body) to avoid CORS preflight issues with Apps Script.
- If you redeploy a new Apps Script version, copy the new Web App URL if Google gives you a new one.
- If the site shows `Sync remoto falló`, open the Apps Script deployment URL directly in a browser and verify it returns JSON.
