# Shai vs Ronald Tracker (Prototype)

Prototipo web para llevar puntos de la competencia, ver un gráfico bonito por año y guardar historial por evento.

Está pensado para empezar simple (funciona local) pero con camino claro para conectar una base de datos después.

## Qué se ve en la página

Cuando abres la app, vas a ver:

- Selector de año (`2020`, `2021`, `2022`...).
- Gráfico acumulado de puntos de Shai y Ronald para el año seleccionado.
- Marcador total del año (quién va ganando).
- UI simple por defecto (historial y herramientas avanzadas están ocultas).
- Botones rápidos para sumar/quitar puntos en 3 categorías:
  - `Llegó a Tiempo`
  - `Empezó la Tarea`
  - `Terminó la Tarea`
- Botón para abrir historial de eventos (con fecha, jugador y tipo de punto).
- Botón `Admin / DB` para mostrar backups (`Exportar` / `Importar`) y herramientas de sync.

## Qué hace ya (funcional)

- Datos históricos precargados (`2020` a `2024`)
- Vista por año con gráfico acumulado
- Registro por evento con fecha (no solo totales)
- Persistencia local automática (`localStorage`)
- Historial editable (puedes borrar eventos individuales)
- Backups en JSON (exportar/importar)
- Migración automática desde la clave vieja `shai-vs-ronald-events`
- Soporte opcional para sync remoto con `VITE_EVENTS_API_URL`

## Ejemplo rápido de uso (2 minutos)

1. Abre la app.
2. Selecciona el año actual (por ejemplo `2026`).
3. Si quieres cargar un punto con fecha de hoy, deja la fecha como está.
4. Si fue un punto de Ronald en "Llegó a Tiempo", toca `Agregar` en la tarjeta de Ronald de esa categoría.
5. Verás inmediatamente:
   - subir el marcador
   - actualizarse el gráfico
   - aparecer un evento nuevo en el historial
6. Recarga la página: el dato debe seguir ahí.
7. Si quieres backup, usa `Exportar 2026` o `Exportar todo`.

## Cómo correrlo local (para probar)

```bash
npm install
npm run dev
```

Luego abre:

- `http://127.0.0.1:5173/`

## Cómo testear que funciona (checklist simple)

- Cambiar de año y ver que el gráfico cambia.
- Agregar puntos a Shai y Ronald en distintas categorías.
- Cambiar la fecha manualmente y agregar un punto antiguo.
- Borrar un evento desde el historial.
- Recargar la página y confirmar que los datos persisten.
- Exportar JSON e importarlo de nuevo (merge o replace).

## Deploy simple (Vercel)

Vite funciona directo en Vercel:

1. Sube este repo a GitHub.
2. Entra a Vercel y haz `Import Project`.
3. Selecciona el repo.
4. Deploy.

## Google Sheets como base de datos (read/write)

Este repo ya trae un backend listo para Google Apps Script:

- `/Users/shai/Documents/dev/2026/shai-vs-ronald-guitar-competition/google-apps-script/Code.gs`
- `/Users/shai/Documents/dev/2026/shai-vs-ronald-guitar-competition/google-apps-script/SETUP.md`

### Resumen rápido

1. Reutiliza el mismo Google Sheet histórico (recomendado).
2. Abre `Extensions -> Apps Script`.
3. Pega `Code.gs`.
4. Configura Script Properties (`SPREADSHEET_ID`, `WRITE_TOKEN`, etc.) y usa una tab nueva (`events` / `svr_events`).
5. Deploy como Web App.
6. Agrega en local/Vercel:
   - `VITE_EVENTS_API_URL`
   - `VITE_EVENTS_API_TOKEN`
7. Redeploy.

Después de eso, la web lee y escribe eventos en Google Sheets.

Nota: la idea es **expandir el mismo spreadsheet**, no reemplazar tus tabs viejas de 2023/2024.

## De dónde salen los datos históricos hoy

Ahora mismo, el historial inicial (`2020-2024`) viene de un **seed en código**, no de lectura en vivo de Google Sheets:

- `src/data/seedEvents.js`

Eso se carga en el primer uso y luego se guarda en localStorage / endpoint remoto (si está configurado).

Además, hay una nota manual de resultado para `2025`:

- `Ronald ganó 2025`, pero no hay tracking semanal/detallado cargado todavía.
- La app lo muestra como nota de año (sin inventar eventos/puntos).

## Datos / storage (simple ahora, future-proof después)

### Modo actual (sin backend)

- Guarda en `localStorage` del navegador.
- Ideal para prototipo rápido / uso inmediato.
- También permite backups JSON manuales.
- `localhost` y Vercel no comparten datos entre sí si no configuras backend.

### Modo recomendado cuando ya quieran usarlo entre dispositivos

- Opción más simple si ya usan Sheets: `Google Apps Script + Google Sheets`
- Opción más robusta / future-proof: `Supabase` (Postgres)

La app ya soporta un endpoint remoto vía `VITE_EVENTS_API_URL` con este contrato:

- `GET` responde `{ "events": [...] }` o `[...]`
- `POST` recibe `{ "events": [...], "updatedAt": "...", "source": "svr-web-prototype", "token?": "..." }`

Eso permite conectar:

- Google Apps Script (leer/escribir un Sheet)
- Supabase Edge Function
- Cualquier API propia

## Estructura del proyecto

- `src/App.jsx`: UI principal (pantalla, gráfico, acciones, historial)
- `src/styles.css`: estilos visuales
- `src/lib/storage.js`: storage local + sync remoto opcional
- `src/lib/events.js`: modelo de eventos, stats, chart utils
- `src/data/seedEvents.js`: seed histórico (`2020-2024`)
- `google-apps-script/Code.gs`: backend para Google Sheets (Apps Script)
- `google-apps-script/SETUP.md`: guía paso a paso para conectarlo

## Estado actual del prototipo

- `npm run build` compila correctamente
- Salida de producción en `dist/`
