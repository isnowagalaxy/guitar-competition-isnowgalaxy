# Shai vs Ronald Tracker (Prototype)

Prototipo web para llevar puntos de la competencia, ver un gráfico bonito por año y guardar historial por evento.

Está pensado para empezar simple (funciona local) pero con camino claro para conectar una base de datos después.

## Qué se ve en la página

Cuando abres la app, vas a ver:

- Selector de año (`2020`, `2021`, `2022`...).
- Gráfico acumulado de puntos de Shai y Ronald para el año seleccionado.
- Marcador total del año (quién va ganando).
- Botones rápidos para sumar/quitar puntos en 3 categorías:
  - `Llegó a Tiempo`
  - `Empezó la Tarea`
  - `Terminó la Tarea`
- Historial de eventos (con fecha, jugador y tipo de punto).
- Botones de backup (`Exportar` / `Importar`) para guardar o restaurar datos.

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

## Datos / storage (simple ahora, future-proof después)

### Modo actual (sin backend)

- Guarda en `localStorage` del navegador.
- Ideal para prototipo rápido / uso inmediato.
- También permite backups JSON manuales.

### Modo recomendado cuando ya quieran usarlo entre dispositivos

- Opción más simple si ya usan Sheets: `Google Apps Script + Google Sheets`
- Opción más robusta / future-proof: `Supabase` (Postgres)

La app ya soporta un endpoint remoto vía `VITE_EVENTS_API_URL` con este contrato:

- `GET` responde `{ "events": [...] }` o `[...]`
- `POST` recibe `{ "events": [...], "updatedAt": "...", "source": "svr-web-prototype" }`

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

## Estado actual del prototipo

- `npm run build` compila correctamente
- Salida de producción en `dist/`
