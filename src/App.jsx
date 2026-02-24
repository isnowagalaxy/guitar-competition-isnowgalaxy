import { useEffect, useRef, useState } from 'react';
import {
  Award,
  BarChart3,
  Calendar,
  CheckCircle2,
  Clock,
  Database,
  Download,
  Plus,
  RefreshCw,
  Trash2,
  Trophy,
  Upload,
} from 'lucide-react';
import {
  PLAYER_META,
  EVENT_TYPE_META,
  buildChartData,
  calculateDashboardStats,
  createEvent,
  downloadJsonFile,
  formatEventDate,
  getMonthTicks,
  getRecentEvents,
  getTodayIsoLocal,
  getYearOptions,
  mergeEvents,
  normalizeEvents,
  sortEvents,
} from './lib/events.js';
import {
  importEventsFromJsonFile,
  loadEventsSnapshot,
  saveEventsSnapshot,
} from './lib/storage.js';

const ACTION_TYPES = [
  { id: 'clase', icon: Clock },
  { id: 'tareaCompletada', icon: Calendar },
  { id: 'tareaTerminada', icon: CheckCircle2 },
];

function getLeaderLabel(shaiTotal, ronaldTotal) {
  if (shaiTotal === ronaldTotal) return null;
  const leader = shaiTotal > ronaldTotal ? 'shai' : 'ronald';
  const diff = Math.abs(shaiTotal - ronaldTotal);
  return {
    player: leader,
    diff,
    text: `${PLAYER_META[leader].name} lidera por ${diff}`,
  };
}

function getStoragePill(syncMeta) {
  if (syncMeta.saving) return { label: 'Guardando…', tone: 'neutral' };
  switch (syncMeta.storageMode) {
    case 'remote':
      return { label: 'Remoto activo', tone: 'success' };
    case 'remote-mirror':
      return { label: 'Local + remoto', tone: 'success' };
    case 'local-unsynced':
      return { label: 'Local (sin sync)', tone: 'warning' };
    case 'local-fallback':
      return { label: 'Local (fallback)', tone: 'warning' };
    default:
      return { label: 'Local (prototipo)', tone: 'neutral' };
  }
}

function ChartCard({ year, chartData }) {
  if (!chartData.length) {
    return (
      <section className="card chart-card">
        <div className="card-header">
          <div>
            <p className="eyebrow">Gráfico</p>
            <h2 className="card-title">Progreso {year}</h2>
          </div>
        </div>
        <div className="empty-state">
          <p>No hay eventos para {year}.</p>
          <span>Agrega puntos con los botones de abajo y el gráfico se actualiza al instante.</span>
        </div>
      </section>
    );
  }

  const width = 100;
  const height = 54;
  const padding = 8;
  const maxValue = Math.max(
    chartData.at(-1)?.shai || 0,
    chartData.at(-1)?.ronald || 0,
    1,
  );
  const denominator = Math.max(chartData.length - 1, 1);
  const xScale = (index) => padding + (index / denominator) * (width - padding * 2);
  const yScale = (value) => height - padding - (value / maxValue) * (height - padding * 2);

  const toPoints = (key) => chartData.map((point, index) => `${xScale(index)},${yScale(point[key])}`).join(' ');
  const shaiPoints = toPoints('shai');
  const ronaldPoints = toPoints('ronald');
  const monthTicks = getMonthTicks(chartData);

  return (
    <section className="card chart-card">
      <div className="card-header">
        <div>
          <p className="eyebrow">Gráfico</p>
          <h2 className="card-title">Progreso {year}</h2>
        </div>
        <div className="chart-legend">
          <span className="legend-item">
            <span className="legend-dot legend-dot-shai" />
            Shai
          </span>
          <span className="legend-item">
            <span className="legend-dot legend-dot-ronald" />
            Ronald
          </span>
        </div>
      </div>

      <div className="chart-wrap">
        <svg viewBox={`0 0 ${width} ${height}`} preserveAspectRatio="none" className="chart-svg" aria-label={`Gráfico de progreso ${year}`}>
          {[0, 0.25, 0.5, 0.75, 1].map((fraction) => (
            <line
              key={fraction}
              x1={padding}
              y1={height - padding - fraction * (height - padding * 2)}
              x2={width - padding}
              y2={height - padding - fraction * (height - padding * 2)}
              className="chart-grid-line"
            />
          ))}

          <path
            d={`M ${padding},${height - padding} L ${shaiPoints} L ${xScale(chartData.length - 1)},${height - padding} Z`}
            fill="rgba(10,132,255,0.1)"
          />
          <path
            d={`M ${padding},${height - padding} L ${ronaldPoints} L ${xScale(chartData.length - 1)},${height - padding} Z`}
            fill="rgba(255,69,58,0.09)"
          />

          <polyline points={shaiPoints} fill="none" stroke={PLAYER_META.shai.color} strokeWidth="0.9" strokeLinecap="round" strokeLinejoin="round" />
          <polyline points={ronaldPoints} fill="none" stroke={PLAYER_META.ronald.color} strokeWidth="0.9" strokeLinecap="round" strokeLinejoin="round" />

          {chartData.map((point, index) => (
            <g key={`${point.date}-${index}`}>
              <circle cx={xScale(index)} cy={yScale(point.shai)} r="0.65" fill={PLAYER_META.shai.color} />
              <circle cx={xScale(index)} cy={yScale(point.ronald)} r="0.65" fill={PLAYER_META.ronald.color} />
            </g>
          ))}
        </svg>

        <div className="chart-months" aria-hidden="true">
          {monthTicks.map((tick) => (
            <span
              key={`${tick.label}-${tick.index}`}
              className="chart-month"
              style={{ left: `${padding + (tick.index / denominator) * (100 - padding * 2)}%` }}
            >
              {tick.label}
            </span>
          ))}
        </div>
      </div>
    </section>
  );
}

function ActionCategoryCard({ typeId, breakdown, onAdd, onRemove }) {
  const Icon = ACTION_TYPES.find((item) => item.id === typeId)?.icon || Plus;
  const typeMeta = EVENT_TYPE_META[typeId];

  return (
    <section className="card action-card">
      <div className="card-header compact">
        <h3 className="section-title with-icon">
          <Icon size={16} />
          {typeMeta.label}
        </h3>
      </div>

      <div className="action-grid">
        {Object.values(PLAYER_META).map((player) => (
          <div key={player.id} className="player-action-block">
            <div className="metric-pill" style={{ '--accent': player.color, '--accent-tint': player.tint }}>
              <span className="metric-label">{player.name}</span>
              <strong className="metric-value">{breakdown[player.id][typeId]}</strong>
            </div>

            <div className="row-buttons">
              <button className="btn btn-primary" style={{ '--btn': player.color }} onClick={() => onAdd(player.id, typeId)}>
                <Plus size={15} />
                Agregar
              </button>
              <button className="btn btn-secondary icon-only" aria-label={`Quitar último punto ${player.name} ${typeMeta.label}`} onClick={() => onRemove(player.id, typeId)}>
                −
              </button>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}

function HistoryCard({ events, onDelete, scope, setScope, selectedYear }) {
  return (
    <section className="card history-card">
      <div className="card-header">
        <div>
          <p className="eyebrow">Historial</p>
          <h2 className="card-title">Eventos registrados</h2>
        </div>
        <div className="segmented">
          <button
            className={`segment ${scope === 'year' ? 'active' : ''}`}
            onClick={() => setScope('year')}
            type="button"
          >
            {selectedYear}
          </button>
          <button
            className={`segment ${scope === 'all' ? 'active' : ''}`}
            onClick={() => setScope('all')}
            type="button"
          >
            Todo
          </button>
        </div>
      </div>

      {events.length === 0 ? (
        <div className="empty-state compact">
          <p>No hay eventos en este filtro.</p>
        </div>
      ) : (
        <ul className="history-list">
          {events.map((event) => {
            const player = PLAYER_META[event.player];
            const type = EVENT_TYPE_META[event.type];
            return (
              <li key={event.id} className="history-row">
                <div className="history-main">
                  <div className="history-line">
                    <span className="player-chip" style={{ '--chip': player.color, '--chip-bg': player.tint }}>
                      {player.name}
                    </span>
                    <span className="type-chip">{type.shortLabel}</span>
                    {event.source === 'seed' ? <span className="source-chip">seed</span> : null}
                  </div>
                  <div className="history-sub">
                    <span>{formatEventDate(event.eventDate)}</span>
                    <span>{event.year}</span>
                  </div>
                </div>

                <button
                  type="button"
                  className="btn btn-ghost icon-only"
                  onClick={() => onDelete(event.id)}
                  aria-label={`Eliminar evento ${player.name} ${type.label}`}
                >
                  <Trash2 size={15} />
                </button>
              </li>
            );
          })}
        </ul>
      )}
    </section>
  );
}

export default function App() {
  const currentYear = String(new Date().getFullYear());
  const [events, setEvents] = useState([]);
  const [selectedYear, setSelectedYear] = useState(currentYear);
  const [entryDate, setEntryDate] = useState(getTodayIsoLocal());
  const [showStats, setShowStats] = useState(false);
  const [historyScope, setHistoryScope] = useState('year');
  const [isLoading, setIsLoading] = useState(true);
  const [statusMessage, setStatusMessage] = useState('');
  const [syncMeta, setSyncMeta] = useState({
    storageMode: 'local',
    remoteConfigured: false,
    remoteError: '',
    saving: false,
    lastSavedAt: '',
  });

  const importInputRef = useRef(null);
  const importModeRef = useRef('merge');

  async function refreshSnapshot() {
    const snapshot = await loadEventsSnapshot();
    setEvents(snapshot.events);
    setSyncMeta((previous) => ({
      ...previous,
      storageMode: snapshot.storageMode,
      remoteConfigured: snapshot.remoteConfigured,
      remoteError: snapshot.remoteError,
      saving: false,
    }));
    setStatusMessage(
      snapshot.storageMode === 'remote'
        ? 'Datos cargados desde endpoint remoto.'
        : 'Datos cargados desde almacenamiento local.',
    );
  }

  useEffect(() => {
    let cancelled = false;

    (async () => {
      try {
        const snapshot = await loadEventsSnapshot();
        if (cancelled) return;
        setEvents(snapshot.events);
        setSyncMeta((previous) => ({
          ...previous,
          storageMode: snapshot.storageMode,
          remoteConfigured: snapshot.remoteConfigured,
          remoteError: snapshot.remoteError,
          saving: false,
        }));
      } catch (error) {
        if (cancelled) return;
        setStatusMessage(error?.message || 'No se pudo cargar la data inicial');
      } finally {
        if (!cancelled) setIsLoading(false);
      }
    })();

    return () => {
      cancelled = true;
    };
  }, []);

  async function persist(nextEvents, notice = '') {
    const normalized = sortEvents(normalizeEvents(nextEvents));
    setEvents(normalized);
    setSyncMeta((previous) => ({ ...previous, saving: true }));

    const result = await saveEventsSnapshot(normalized);
    setEvents(result.events);
    setSyncMeta((previous) => ({
      ...previous,
      storageMode: result.storageMode,
      remoteConfigured: result.remoteConfigured,
      remoteError: result.remoteError,
      saving: false,
      lastSavedAt: new Date().toISOString(),
    }));

    if (notice) setStatusMessage(notice);
  }

  const yearOptions = getYearOptions(events, selectedYear);
  const stats = calculateDashboardStats(events, selectedYear);
  const chartData = buildChartData(events, selectedYear);
  const leader = getLeaderLabel(stats.current.shaiTotal, stats.current.ronaldTotal);
  const historyEvents = getRecentEvents(events, {
    year: historyScope === 'all' ? 'all' : selectedYear,
    limit: historyScope === 'all' ? 60 : 40,
  });
  const storagePill = getStoragePill(syncMeta);

  const addPoint = (player, type) => {
    const newEvent = createEvent({
      player,
      type,
      eventDate: entryDate,
      source: 'manual',
    });
    if (newEvent.year !== selectedYear) {
      setSelectedYear(newEvent.year);
    }
    persist([...events, newEvent], `Punto agregado: ${PLAYER_META[player].name} · ${EVENT_TYPE_META[type].shortLabel}`);
  };

  const removeLastPoint = (player, type) => {
    const target = [...events]
      .filter((event) => event.year === selectedYear && event.player === player && event.type === type)
      .sort((a, b) => {
        const byDate = b.eventDate.localeCompare(a.eventDate);
        if (byDate !== 0) return byDate;
        const byCreated = (b.createdAt || '').localeCompare(a.createdAt || '');
        if (byCreated !== 0) return byCreated;
        return String(b.id).localeCompare(String(a.id));
      })[0];

    if (!target) {
      setStatusMessage('No hay un punto para quitar en esa categoría.');
      return;
    }

    persist(
      events.filter((event) => event.id !== target.id),
      `Se quitó el último punto de ${PLAYER_META[player].name} (${EVENT_TYPE_META[type].shortLabel}).`,
    );
  };

  const deleteEvent = (eventId) => {
    const event = events.find((item) => item.id === eventId);
    if (!event) return;
    persist(
      events.filter((item) => item.id !== eventId),
      `Evento eliminado: ${PLAYER_META[event.player].name} · ${EVENT_TYPE_META[event.type].shortLabel}`,
    );
  };

  const exportAll = () => {
    downloadJsonFile('svr-events-all.json', {
      version: 1,
      exportedAt: new Date().toISOString(),
      scope: 'all',
      events,
    });
    setStatusMessage('Backup exportado (todos los años).');
  };

  const exportSelectedYear = () => {
    const selectedYearEvents = events.filter((event) => event.year === selectedYear);
    downloadJsonFile(`svr-events-${selectedYear}.json`, {
      version: 1,
      exportedAt: new Date().toISOString(),
      scope: 'year',
      year: selectedYear,
      events: selectedYearEvents,
    });
    setStatusMessage(`Backup exportado (${selectedYear}).`);
  };

  const openImportPicker = (mode) => {
    importModeRef.current = mode;
    importInputRef.current?.click();
  };

  const onImportFileChange = async (event) => {
    const file = event.target.files?.[0];
    event.target.value = '';
    if (!file) return;

    try {
      const importedEvents = await importEventsFromJsonFile(file);
      const nextEvents =
        importModeRef.current === 'replace' ? importedEvents : mergeEvents(events, importedEvents);
      await persist(
        nextEvents,
        importModeRef.current === 'replace'
          ? `Importación completa: se reemplazaron ${nextEvents.length} eventos.`
          : `Importación completa: merge con ${importedEvents.length} eventos.`,
      );
    } catch (error) {
      setStatusMessage(error?.message || 'No se pudo importar el archivo.');
    }
  };

  const selectedBreakdown = stats.current.breakdown;

  return (
    <div className="app-shell">
      <div className="backdrop backdrop-a" />
      <div className="backdrop backdrop-b" />

      <main className="app-container">
        <header className="hero card">
          <div className="hero-top">
            <div className="hero-title-wrap">
              <div className="hero-icon">
                <Trophy size={20} />
              </div>
              <div>
                <p className="eyebrow">Competition Tracker</p>
                <h1 className="hero-title">Shai vs Ronald</h1>
              </div>
            </div>

            <div className="hero-actions">
              <span className={`status-pill ${storagePill.tone}`}>{storagePill.label}</span>
              <button className="btn btn-secondary" onClick={() => setShowStats((v) => !v)} type="button">
                <BarChart3 size={15} />
                {showStats ? 'Ocultar stats' : 'Ver stats'}
              </button>
            </div>
          </div>

          <div className="toolbar-grid">
            <div className="toolbar-section">
              <label className="field-label" htmlFor="entry-date">
                Fecha del punto
              </label>
              <div className="toolbar-inline">
                <input
                  id="entry-date"
                  type="date"
                  className="date-input"
                  value={entryDate}
                  onChange={(e) => setEntryDate(e.target.value)}
                />
                <button className="btn btn-secondary" type="button" onClick={() => setEntryDate(getTodayIsoLocal())}>
                  Hoy
                </button>
              </div>
            </div>

            <div className="toolbar-section">
              <label className="field-label">Backups / DB</label>
              <div className="toolbar-inline wrap">
                <button className="btn btn-secondary" type="button" onClick={exportSelectedYear}>
                  <Download size={15} />
                  Exportar {selectedYear}
                </button>
                <button className="btn btn-secondary" type="button" onClick={exportAll}>
                  <Download size={15} />
                  Exportar todo
                </button>
                <button className="btn btn-secondary" type="button" onClick={() => openImportPicker('merge')}>
                  <Upload size={15} />
                  Importar (merge)
                </button>
                <button className="btn btn-secondary" type="button" onClick={() => openImportPicker('replace')}>
                  <Upload size={15} />
                  Importar (replace)
                </button>
                <button className="btn btn-secondary" type="button" onClick={refreshSnapshot}>
                  <RefreshCw size={15} />
                  Recargar
                </button>
              </div>
            </div>
          </div>

          <input
            ref={importInputRef}
            type="file"
            accept="application/json"
            onChange={onImportFileChange}
            className="hidden-file-input"
          />

          <div className="year-strip" role="tablist" aria-label="Seleccionar año">
            {yearOptions.map((year) => (
              <button
                key={year}
                type="button"
                role="tab"
                aria-selected={selectedYear === year}
                className={`year-pill ${selectedYear === year ? 'active' : ''}`}
                onClick={() => setSelectedYear(year)}
              >
                {year}
              </button>
            ))}
          </div>

          <div className="status-note-wrap">
            <div className="status-note">
              <Database size={14} />
              <span>
                Prototipo local-first. Si defines <code>VITE_EVENTS_API_URL</code>, la app intenta cargar/guardar por
                GET/POST (ideal para Google Apps Script o Supabase Edge).
              </span>
            </div>
            {statusMessage ? <div className="status-message">{statusMessage}</div> : null}
            {syncMeta.remoteError ? <div className="status-warning">Sync remoto falló: {syncMeta.remoteError}</div> : null}
          </div>
        </header>

        <ChartCard year={selectedYear} chartData={chartData} />

        <section className="card score-card">
          <div className="card-header">
            <div>
              <p className="eyebrow">Marcador</p>
              <h2 className="card-title">{selectedYear}</h2>
            </div>
            {leader ? (
              <div className="leader-pill" style={{ '--leader': PLAYER_META[leader.player].color, '--leader-bg': PLAYER_META[leader.player].tint }}>
                <Award size={15} />
                <span>{leader.text}</span>
              </div>
            ) : (
              <div className="leader-pill tie">
                <Award size={15} />
                <span>Empate</span>
              </div>
            )}
          </div>

          <div className="score-grid">
            {Object.values(PLAYER_META).map((player) => {
              const total = player.id === 'shai' ? stats.current.shaiTotal : stats.current.ronaldTotal;
              return (
                <div key={player.id} className="score-box" style={{ '--score': player.color, '--score-bg': player.tint }}>
                  <span className="score-name">{player.name}</span>
                  <strong className="score-value">{total}</strong>
                </div>
              );
            })}
          </div>
        </section>

        {showStats ? (
          <section className="card stats-card">
            <div className="card-header">
              <div>
                <p className="eyebrow">Stats</p>
                <h2 className="card-title">Resumen de {selectedYear}</h2>
              </div>
            </div>

            <div className="stats-grid">
              <div className="stat-tile" style={{ '--tile': PLAYER_META.shai.color, '--tile-bg': PLAYER_META.shai.tint }}>
                <span className="stat-label">Shai</span>
                <strong className="stat-value">{stats.current.shaiPct}%</strong>
                <span className="stat-sub">{stats.current.shaiTotal} puntos</span>
              </div>
              <div className="stat-tile" style={{ '--tile': PLAYER_META.ronald.color, '--tile-bg': PLAYER_META.ronald.tint }}>
                <span className="stat-label">Ronald</span>
                <strong className="stat-value">{stats.current.ronaldPct}%</strong>
                <span className="stat-sub">{stats.current.ronaldTotal} puntos</span>
              </div>
            </div>

            <div className="stats-lines">
              <div className="stats-line">
                <span>Récord histórico</span>
                <strong>
                  {stats.allTime.shaiTotal} - {stats.allTime.ronaldTotal}
                </strong>
              </div>
              <div className="stats-line">
                <span>Años ganados</span>
                <strong>
                  Shai {stats.allTime.shaiYearsWon} · Ronald {stats.allTime.ronaldYearsWon}
                </strong>
              </div>
            </div>
          </section>
        ) : null}

        <div className="actions-stack">
          {ACTION_TYPES.map((item) => (
            <ActionCategoryCard
              key={item.id}
              typeId={item.id}
              breakdown={selectedBreakdown}
              onAdd={addPoint}
              onRemove={removeLastPoint}
            />
          ))}
        </div>

        <HistoryCard
          events={historyEvents}
          onDelete={deleteEvent}
          scope={historyScope}
          setScope={setHistoryScope}
          selectedYear={selectedYear}
        />

        {isLoading ? <div className="loading-overlay">Cargando…</div> : null}
      </main>
    </div>
  );
}
