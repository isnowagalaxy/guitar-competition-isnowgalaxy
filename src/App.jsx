import { useEffect, useRef, useState } from 'react';
import {
  Award,
  BarChart3,
  Calendar,
  CheckCircle2,
  Clock,
  Database,
  Download,
  Lock,
  RefreshCw,
  Trash2,
  Trophy,
  Unlock,
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
  validateRemoteWriteToken,
} from './lib/storage.js';

const ACTION_TYPES = [
  { id: 'clase', icon: Clock },
  { id: 'tareaCompletada', icon: Calendar },
  { id: 'tareaTerminada', icon: CheckCircle2 },
];

const EDIT_TOKEN_SESSION_KEY = 'svr-edit-token-session';

function getLeaderLabel(shaiTotal, ronaldTotal, outcomeOverride = null) {
  if (shaiTotal === ronaldTotal) {
    const overrideWinner = outcomeOverride?.winner;
    if (overrideWinner && PLAYER_META[overrideWinner]) {
      return {
        player: overrideWinner,
        diff: null,
        text: `${PLAYER_META[overrideWinner].name} lidera`,
      };
    }
    return null;
  }
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
    case 'remote-empty-merged':
      return { label: 'Remoto vacío (local preservado)', tone: 'warning' };
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
  const [activeIndex, setActiveIndex] = useState(null);
  const [chartView, setChartView] = useState('score');
  const [chartScale, setChartScale] = useState('auto');

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
  const rawMaxValue = Math.max(
    chartData.at(-1)?.shai || 0,
    chartData.at(-1)?.ronald || 0,
    1,
  );
  const maxValue =
    chartScale === 'wide'
      ? Math.ceil(rawMaxValue * 1.45)
      : chartScale === 'close'
        ? rawMaxValue
        : Math.ceil(rawMaxValue * 1.12);
  const denominator = Math.max(chartData.length - 1, 1);
  const xScale = (index) => padding + (index / denominator) * (width - padding * 2);
  const yScale = (value) => height - padding - (value / maxValue) * (height - padding * 2);

  const toPoints = (key) => chartData.map((point, index) => `${xScale(index)},${yScale(point[key])}`).join(' ');
  const shaiPoints = toPoints('shai');
  const ronaldPoints = toPoints('ronald');
  const monthTicks = getMonthTicks(chartData);
  const rawGapMaxValue = Math.max(...chartData.map((point) => Math.abs(point.shai - point.ronald)), 1);
  const gapMaxValue =
    chartScale === 'wide'
      ? Math.ceil(rawGapMaxValue * 2)
      : chartScale === 'close'
        ? rawGapMaxValue
        : Math.ceil(rawGapMaxValue * 1.25);
  const gapMidpoint = height / 2;
  const yGapScale = (value) => gapMidpoint - (value / gapMaxValue) * (height / 2 - padding);
  const gapPoints = chartData.map((point, index) => `${xScale(index)},${yGapScale(point.shai - point.ronald)}`).join(' ');
  const inspectedIndex = activeIndex ?? chartData.length - 1;
  const inspectedPoint = chartData[inspectedIndex];
  const inspectedX = xScale(inspectedIndex);
  const inspectedLeader =
    inspectedPoint && inspectedPoint.shai !== inspectedPoint.ronald
      ? (inspectedPoint.shai > inspectedPoint.ronald ? 'shai' : 'ronald')
      : null;
  const inspectedDiff = inspectedPoint ? Math.abs(inspectedPoint.shai - inspectedPoint.ronald) : 0;
  const inspectedGap = inspectedPoint ? inspectedPoint.shai - inspectedPoint.ronald : 0;
  const inspectedY =
    chartView === 'gap'
      ? yGapScale(inspectedGap)
      : yScale(inspectedLeader === 'ronald' ? inspectedPoint.ronald : inspectedPoint.shai);
  const inspectedLeftPct = (inspectedX / width) * 100;
  const inspectedTopPct = (inspectedY / height) * 100;
  const shaiMarkerTopPct = (yScale(inspectedPoint.shai) / height) * 100;
  const ronaldMarkerTopPct = (yScale(inspectedPoint.ronald) / height) * 100;
  const leaderTone = inspectedLeader || 'tie';
  const yAxisLabels =
    chartView === 'gap'
      ? [
          { label: `+${gapMaxValue}`, top: `${(yGapScale(gapMaxValue) / height) * 100}%` },
          { label: '0', top: `${(yGapScale(0) / height) * 100}%` },
          { label: `-${gapMaxValue}`, top: `${(yGapScale(-gapMaxValue) / height) * 100}%` },
        ]
      : [
          { label: String(maxValue), top: `${(yScale(maxValue) / height) * 100}%` },
          { label: String(Math.round(maxValue / 2)), top: `${(yScale(maxValue / 2) / height) * 100}%` },
          { label: '0', top: `${(yScale(0) / height) * 100}%` },
        ];
  const clearActiveIndex = () => setActiveIndex(null);

  return (
    <section className="card chart-card">
      <div className="card-header">
        <div>
          <p className="eyebrow">Gráfico</p>
          <h2 className="card-title">Progreso {year}</h2>
        </div>
        <div className="chart-tools">
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
          <div className="segmented chart-mode-toggle" aria-label="Vista del gráfico">
            <button
              className={`segment ${chartView === 'score' ? 'active' : ''}`}
              type="button"
              onClick={() => setChartView('score')}
            >
              Acumulado
            </button>
            <button
              className={`segment ${chartView === 'gap' ? 'active' : ''}`}
              type="button"
              onClick={() => setChartView('gap')}
            >
              Diferencia
            </button>
          </div>
          <div className="segmented chart-scale-toggle" aria-label="Escala del gráfico">
            <button
              className={`segment ${chartScale === 'auto' ? 'active' : ''}`}
              type="button"
              onClick={() => setChartScale('auto')}
            >
              Auto
            </button>
            <button
              className={`segment ${chartScale === 'close' ? 'active' : ''}`}
              type="button"
              onClick={() => setChartScale('close')}
            >
              Close
            </button>
            <button
              className={`segment ${chartScale === 'wide' ? 'active' : ''}`}
              type="button"
              onClick={() => setChartScale('wide')}
            >
              Wide
            </button>
          </div>
        </div>
      </div>

      <div className="chart-readout" role="status">
        <span className="chart-readout-date">{formatEventDate(inspectedPoint.date)}</span>
        <span className="chart-readout-score shai">Shai {inspectedPoint.shai}</span>
        <span className="chart-readout-score ronald">Ronald {inspectedPoint.ronald}</span>
        <strong
          className={`chart-readout-leader ${leaderTone}`}
          style={{
            '--leader-color': inspectedLeader ? PLAYER_META[inspectedLeader].color : '#3a4251',
            '--leader-bg': inspectedLeader ? PLAYER_META[inspectedLeader].tint : 'rgba(16, 19, 24, 0.05)',
          }}
        >
          {inspectedLeader ? `Diferencia: ${PLAYER_META[inspectedLeader].name} por ${inspectedDiff}` : 'Diferencia: empate'}
        </strong>
      </div>

      <div
        className="chart-wrap"
        onMouseLeave={clearActiveIndex}
      >
        <div className="chart-y-axis" aria-hidden="true">
          <span className="chart-y-axis-title">{chartView === 'gap' ? 'Dif.' : 'Pts'}</span>
          {yAxisLabels.map((label) => (
            <span key={`${chartView}-${label.label}-${label.top}`} style={{ top: label.top }}>
              {label.label}
            </span>
          ))}
        </div>
        <div className="chart-plot-area">
          <svg viewBox={`0 0 ${width} ${height}`} preserveAspectRatio="none" className="chart-svg" aria-label={`Gráfico de progreso ${year}`}>
            <defs>
              <linearGradient id={`gap-line-${year}`} x1="0" x2="0" y1="0" y2="1">
                <stop offset="0%" stopColor={PLAYER_META.shai.color} />
                <stop offset="49%" stopColor={PLAYER_META.shai.color} />
                <stop offset="50%" stopColor="#7a8496" />
                <stop offset="51%" stopColor={PLAYER_META.ronald.color} />
                <stop offset="100%" stopColor={PLAYER_META.ronald.color} />
              </linearGradient>
            </defs>
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

            {chartView === 'gap' ? (
              <>
                <rect
                  x={padding}
                  y={padding}
                  width={width - padding * 2}
                  height={gapMidpoint - padding}
                  className="chart-gap-band chart-gap-band-shai"
                />
                <rect
                  x={padding}
                  y={gapMidpoint}
                  width={width - padding * 2}
                  height={height - padding - gapMidpoint}
                  className="chart-gap-band chart-gap-band-ronald"
                />
                <line x1={padding} y1={yGapScale(0)} x2={width - padding} y2={yGapScale(0)} className="chart-zero-line" />
                <polyline points={gapPoints} fill="none" stroke={`url(#gap-line-${year})`} strokeWidth="1.05" strokeLinecap="round" strokeLinejoin="round" />
              </>
            ) : (
              <>
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
              </>
            )}

            {activeIndex !== null ? (
              <line
                x1={inspectedX}
                y1={padding}
                x2={inspectedX}
                y2={height - padding}
                className="chart-hover-line"
                aria-hidden="true"
              />
            ) : null}

            {chartView === 'score'
              ? chartData.map((point, index) => (
                  <g key={`${point.date}-${index}`}>
                    <circle cx={xScale(index)} cy={yScale(point.shai)} r="0.65" fill={PLAYER_META.shai.color} />
                    <circle cx={xScale(index)} cy={yScale(point.ronald)} r="0.65" fill={PLAYER_META.ronald.color} />
                  </g>
                ))
              : null}

            {chartData.map((point, index) => (
              <rect
                key={`hit-${point.date}-${index}`}
                x={xScale(index) - Math.max((width - padding * 2) / denominator / 2, 2)}
                y={padding}
                width={Math.max((width - padding * 2) / denominator, 4)}
                height={height - padding * 2}
                className="chart-hit-zone"
                tabIndex="0"
                role="button"
                aria-label={`${formatEventDate(point.date)}: Shai ${point.shai}, Ronald ${point.ronald}`}
                onMouseEnter={() => setActiveIndex(index)}
                onFocus={() => setActiveIndex(index)}
                onBlur={clearActiveIndex}
                onClick={() => setActiveIndex(index)}
              />
            ))}
          </svg>

          {chartView === 'gap' ? (
            <div className="chart-gap-labels" aria-hidden="true">
              <span className="chart-gap-label shai">Shai gana por...</span>
              <span className="chart-gap-label ronald">Ronald gana por...</span>
            </div>
          ) : null}

          {activeIndex !== null ? (
            chartView === 'gap' ? (
              <span
                className={`chart-focus-dot ${inspectedGap >= 0 ? 'shai' : 'ronald'}`}
                style={{ left: `${inspectedLeftPct}%`, top: `${inspectedTopPct}%` }}
                aria-hidden="true"
              />
            ) : (
              <>
                <span
                  className="chart-focus-dot shai"
                  style={{ left: `${inspectedLeftPct}%`, top: `${shaiMarkerTopPct}%` }}
                  aria-hidden="true"
                />
                <span
                  className="chart-focus-dot ronald"
                  style={{ left: `${inspectedLeftPct}%`, top: `${ronaldMarkerTopPct}%` }}
                  aria-hidden="true"
                />
              </>
            )
          ) : null}

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
      </div>
    </section>
  );
}

function QuickAddCard({
  breakdown,
  entryDate,
  onChangeDate,
  onResetDate,
  onAdd,
  onRemove,
  onToggleHistory,
  showHistory,
  canEdit,
}) {
  return (
    <section className="card quick-add-card">
      <div className="card-header">
        <div>
          <p className="eyebrow">Quick Add</p>
          <h2 className="card-title">Puntos</h2>
        </div>
        <button className="btn btn-secondary" type="button" onClick={onToggleHistory}>
          {showHistory ? 'Ocultar historial' : 'Ver historial'}
        </button>
      </div>

      <div className="quick-date-row">
        <label className="field-label" htmlFor="quick-entry-date">
          Fecha
        </label>
        <div className="toolbar-inline">
          <input
            id="quick-entry-date"
            type="date"
            className="date-input"
            value={entryDate}
            onChange={(e) => onChangeDate(e.target.value)}
          />
          <button className="btn btn-secondary" type="button" onClick={onResetDate}>
            Hoy
          </button>
        </div>
      </div>

      <div className="quick-matrix">
        {ACTION_TYPES.map((action) => {
          const typeMeta = EVENT_TYPE_META[action.id];
          const Icon = action.icon;
          return (
            <section key={action.id} className="quick-category-row">
              <div className="quick-category-header">
                <span className="quick-category-icon">
                  <Icon size={14} />
                </span>
                <div className="quick-category-copy">
                  <span className="quick-category-title">{typeMeta.label}</span>
                  <span className="quick-category-short">{typeMeta.shortLabel}</span>
                </div>
              </div>

              <div className="quick-player-controls-grid">
                {Object.values(PLAYER_META).map((player) => (
                  <div
                    key={`${action.id}-${player.id}`}
                    className="quick-player-control"
                    style={{ '--accent': player.color, '--accent-tint': player.tint }}
                  >
                    <div className="quick-player-topline">
                      <span className="quick-player-label">{player.name}</span>
                      <strong className="quick-player-count">{breakdown[player.id][action.id]}</strong>
                    </div>
                    <div className="quick-player-buttons">
                      <button
                        type="button"
                        className="quick-action-btn minus"
                        aria-label={`Quitar último punto ${player.name} ${typeMeta.label}`}
                        onClick={() => onRemove(player.id, action.id)}
                        disabled={!canEdit}
                      >
                        −
                      </button>
                      <button
                        type="button"
                        className="quick-action-btn plus"
                        aria-label={`Agregar punto ${player.name} ${typeMeta.label}`}
                        onClick={() => onAdd(player.id, action.id)}
                        disabled={!canEdit}
                      >
                        +
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </section>
          );
        })}
      </div>

      {!canEdit ? (
        <div className="edit-lock-note">
          <Lock size={14} />
          <span>Modo lectura. Abre `Admin / DB` y desbloquea edición con tu key.</span>
        </div>
      ) : null}
    </section>
  );
}

function HistoryCard({ events, onDelete, scope, setScope, selectedYear, canEdit }) {
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

                {canEdit ? (
                  <button
                    type="button"
                    className="btn btn-ghost icon-only"
                    onClick={() => onDelete(event.id)}
                    aria-label={`Eliminar evento ${player.name} ${type.label}`}
                  >
                    <Trash2 size={15} />
                  </button>
                ) : null}
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
  const bundledWriteToken = (import.meta.env?.VITE_EVENTS_API_TOKEN || '').trim();
  const [events, setEvents] = useState([]);
  const [selectedYear, setSelectedYear] = useState(currentYear);
  const [entryDate, setEntryDate] = useState(getTodayIsoLocal());
  const [showStats, setShowStats] = useState(false);
  const [showAdminPanel, setShowAdminPanel] = useState(false);
  const [showHistory, setShowHistory] = useState(false);
  const [historyScope, setHistoryScope] = useState('year');
  const [editTokenInput, setEditTokenInput] = useState('');
  const [sessionEditToken, setSessionEditToken] = useState(() => {
    if (typeof window === 'undefined') return '';
    return sessionStorage.getItem(EDIT_TOKEN_SESSION_KEY) || '';
  });
  const [isLoading, setIsLoading] = useState(true);
  const [isUnlocking, setIsUnlocking] = useState(false);
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
  const pendingSaveRef = useRef(null);
  const saveInFlightRef = useRef(false);
  const activeWriteToken = (sessionEditToken || bundledWriteToken || '').trim();
  const canEdit = Boolean(activeWriteToken);
  const hasBundledWriteToken = Boolean(bundledWriteToken);

  async function refreshSnapshot() {
    const snapshot = await loadEventsSnapshot({ tokenOverride: activeWriteToken });
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
        const snapshot = await loadEventsSnapshot({ tokenOverride: activeWriteToken });
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
  }, [activeWriteToken]);

  function queueSave(eventsToSave, notice = '', token = activeWriteToken) {
    pendingSaveRef.current = {
      events: sortEvents(normalizeEvents(eventsToSave)),
      notice,
      token,
    };
    void flushSaveQueue();
  }

  async function flushSaveQueue() {
    if (saveInFlightRef.current) return;
    saveInFlightRef.current = true;

    try {
      while (pendingSaveRef.current) {
        const job = pendingSaveRef.current;
        pendingSaveRef.current = null;

        setSyncMeta((previous) => ({ ...previous, saving: true }));
        const result = await saveEventsSnapshot(job.events, { tokenOverride: job.token });
        setSyncMeta((previous) => ({
          ...previous,
          storageMode: result.storageMode,
          remoteConfigured: result.remoteConfigured,
          remoteError: result.remoteError,
          saving: Boolean(pendingSaveRef.current),
          lastSavedAt: new Date().toISOString(),
        }));

        if (job.notice) setStatusMessage(job.notice);
      }
    } finally {
      saveInFlightRef.current = false;
      setSyncMeta((previous) => ({ ...previous, saving: false }));
    }
  }

  function persist(nextEventsOrUpdater, notice = '') {
    setEvents((currentEvents) => {
      const isUpdater = typeof nextEventsOrUpdater === 'function';
      const nextEvents =
        isUpdater
          ? nextEventsOrUpdater(currentEvents)
          : nextEventsOrUpdater;
      if (isUpdater && nextEvents === currentEvents) return currentEvents;
      const normalized = sortEvents(normalizeEvents(nextEvents));
      queueSave(normalized, notice, activeWriteToken);
      return normalized;
    });
  }

  const requireEdit = () => {
    if (canEdit) return true;
    setShowAdminPanel(true);
    setStatusMessage('Modo lectura: abre Admin / DB y pega tu key para editar.');
    return false;
  };

  const unlockEditing = async () => {
    const token = editTokenInput.trim();
    if (!token) {
      setStatusMessage('Pega tu write token para desbloquear.');
      return;
    }

    setIsUnlocking(true);
    try {
      const validation = await validateRemoteWriteToken(events, { tokenOverride: token });

      if (!validation.ok) {
        if (validation.skipped) {
          setStatusMessage('No se puede validar el token: falta endpoint remoto.');
        } else if ((validation.reason || '').toLowerCase().includes('unauthorized')) {
          setStatusMessage('Write token inválido.');
        } else {
          setStatusMessage(`No se pudo validar el token (${validation.reason}).`);
        }
        return;
      }

      try {
        sessionStorage.setItem(EDIT_TOKEN_SESSION_KEY, token);
      } catch {}
      setSessionEditToken(token);
      setEditTokenInput('');
      setStatusMessage('Edición desbloqueada en este navegador.');
    } finally {
      setIsUnlocking(false);
    }
  };

  const lockEditing = () => {
    try {
      sessionStorage.removeItem(EDIT_TOKEN_SESSION_KEY);
    } catch {}
    setSessionEditToken('');
    setEditTokenInput('');
    setStatusMessage(hasBundledWriteToken ? 'Edición sigue habilitada por token en env local.' : 'Edición bloqueada.');
  };

  const yearOptions = getYearOptions(events, selectedYear);
  const stats = calculateDashboardStats(events, selectedYear);
  const chartData = buildChartData(events, selectedYear);
  const leader = getLeaderLabel(
    stats.current.shaiTotal,
    stats.current.ronaldTotal,
    stats.current.outcomeOverride,
  );
  const historyEvents = getRecentEvents(events, {
    year: historyScope === 'all' ? 'all' : selectedYear,
    limit: historyScope === 'all' ? 60 : 40,
  });
  const storagePill = getStoragePill(syncMeta);

  const addPoint = (player, type) => {
    if (!requireEdit()) return;
    const newEvent = createEvent({
      player,
      type,
      eventDate: entryDate,
      source: 'manual',
    });
    if (newEvent.year !== selectedYear) {
      setSelectedYear(newEvent.year);
    }
    persist(
      (currentEvents) => [...currentEvents, newEvent],
      `Punto agregado: ${PLAYER_META[player].name} · ${EVENT_TYPE_META[type].shortLabel}`,
    );
  };

  const removeLastPoint = (player, type) => {
    if (!requireEdit()) return;
    persist(
      (currentEvents) => {
        const target = [...currentEvents]
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
          return currentEvents;
        }

        return currentEvents.filter((event) => event.id !== target.id);
      },
      `Se quitó el último punto de ${PLAYER_META[player].name} (${EVENT_TYPE_META[type].shortLabel}).`,
    );
  };

  const deleteEvent = (eventId) => {
    if (!requireEdit()) return;
    const event = events.find((item) => item.id === eventId);
    if (!event) return;
    persist(
      (currentEvents) => currentEvents.filter((item) => item.id !== eventId),
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

  const syncNow = async () => {
    if (!requireEdit()) return;
    await persist(events, 'Sync manual completado.');
  };

  const openImportPicker = (mode) => {
    if (!requireEdit()) return;
    importModeRef.current = mode;
    importInputRef.current?.click();
  };

  const onImportFileChange = async (event) => {
    if (!requireEdit()) return;
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
  const yearOutcomeOverride = stats.current.outcomeOverride;

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
                <p className="eyebrow hero-kicker">Guitar Competition</p>
                <h1 className="hero-title">
                  <span className="hero-name-shai">Shai</span>{' '}
                  <span className="hero-vs">vs</span>{' '}
                  <span className="hero-name-ronald">Ronald</span>
                </h1>
              </div>
            </div>

            <div className="hero-actions">
              {showAdminPanel ? <span className={`status-pill ${storagePill.tone}`}>{storagePill.label}</span> : null}
              <button
                className="btn btn-secondary"
                onClick={() => setShowAdminPanel((v) => !v)}
                type="button"
              >
                <Database size={15} />
                {showAdminPanel ? 'Cerrar admin' : 'Admin / DB'}
              </button>
              <button className="btn btn-secondary" onClick={() => setShowStats((v) => !v)} type="button">
                <BarChart3 size={15} />
                {showStats ? 'Ocultar stats' : 'Ver stats'}
              </button>
            </div>
          </div>

          {showAdminPanel ? (
            <div className="toolbar-grid">
              <div className="toolbar-section">
                <label className="field-label">Modo edición</label>
                <div className="admin-edit-row">
                  {canEdit ? (
                    <>
                      <span className="edit-status-pill unlocked">
                        <Unlock size={13} />
                        Edición habilitada
                      </span>
                      {!hasBundledWriteToken ? (
                        <button className="btn btn-secondary" type="button" onClick={lockEditing}>
                          <Lock size={15} />
                          Bloquear
                        </button>
                      ) : (
                        <span className="edit-inline-note">Token en env (ideal solo local).</span>
                      )}
                    </>
                  ) : (
                    <>
                      <input
                        type="password"
                        className="date-input admin-secret-input"
                        placeholder="Pega tu write token"
                        value={editTokenInput}
                        disabled={isUnlocking}
                        onChange={(e) => setEditTokenInput(e.target.value)}
                      />
                      <button
                        className="btn btn-secondary"
                        type="button"
                        onClick={unlockEditing}
                        disabled={isUnlocking}
                      >
                        <Unlock size={15} />
                        {isUnlocking ? 'Validando…' : 'Desbloquear'}
                      </button>
                    </>
                  )}
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
                  <button className="btn btn-secondary" type="button" onClick={() => openImportPicker('merge')} disabled={!canEdit}>
                    <Upload size={15} />
                    Importar (merge)
                  </button>
                  <button className="btn btn-secondary" type="button" onClick={() => openImportPicker('replace')} disabled={!canEdit}>
                    <Upload size={15} />
                    Importar (replace)
                  </button>
                  <button className="btn btn-secondary" type="button" onClick={syncNow} disabled={!canEdit}>
                    <Database size={15} />
                    Sync ahora
                  </button>
                  <button className="btn btn-secondary" type="button" onClick={refreshSnapshot}>
                    <RefreshCw size={15} />
                    Recargar
                  </button>
                </div>
              </div>
            </div>
          ) : null}

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

          {showAdminPanel ? (
            <div className="status-note-wrap">
              <div className="status-note">
                <Database size={14} />
                <span>
                  Modo público: deja solo <code>VITE_EVENTS_API_URL</code> en Vercel. Para editar, desbloquea aquí con tu
                  write token.
                </span>
              </div>
              {statusMessage ? <div className="status-message">{statusMessage}</div> : null}
              {syncMeta.remoteError ? <div className="status-warning">Sync remoto falló: {syncMeta.remoteError}</div> : null}
            </div>
          ) : statusMessage ? (
            <div className="status-note-wrap">
              <div className="status-message">{statusMessage}</div>
            </div>
          ) : null}
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

          {yearOutcomeOverride ? (
            <div className="year-outcome-note">
              <span className="year-outcome-label">Nota {selectedYear}</span>
              <span>{yearOutcomeOverride.note}</span>
            </div>
          ) : null}
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

        <QuickAddCard
          breakdown={selectedBreakdown}
          entryDate={entryDate}
          onChangeDate={setEntryDate}
          onResetDate={() => setEntryDate(getTodayIsoLocal())}
          onAdd={addPoint}
          onRemove={removeLastPoint}
          onToggleHistory={() => setShowHistory((v) => !v)}
          showHistory={showHistory}
          canEdit={canEdit}
        />

        {!showAdminPanel ? (
          <section className="card mini-controls-card">
            <div className="mini-controls-row">
              <button
                className="btn btn-secondary"
                type="button"
                onClick={() => setShowAdminPanel(true)}
              >
                Admin / DB
              </button>
            </div>
          </section>
        ) : null}

        {showHistory ? (
          <HistoryCard
            events={historyEvents}
            onDelete={deleteEvent}
            scope={historyScope}
            setScope={setHistoryScope}
            selectedYear={selectedYear}
            canEdit={canEdit}
          />
        ) : null}

        {isLoading ? <div className="loading-overlay">Cargando…</div> : null}
      </main>
    </div>
  );
}
