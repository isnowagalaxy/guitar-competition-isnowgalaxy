import React, { useState, useEffect } from 'react';
import { Trophy, Plus, Calendar, BarChart3, CheckCircle2, Clock, Award } from 'lucide-react';

export default function ShaiVsRonaldApp() {
  const [selectedYear, setSelectedYear] = useState('2024');
  const [allEvents, setAllEvents] = useState([]);
  const [showStats, setShowStats] = useState(false);

  useEffect(() => {
    loadInitialData();
  }, []);

  const loadInitialData = () => {
    try {
      const stored = localStorage.getItem('shai-vs-ronald-events');
      if (stored) {
        setAllEvents(JSON.parse(stored));
      } else {
        const initialEvents = getAllYearsData();
        setAllEvents(initialEvents);
        localStorage.setItem('shai-vs-ronald-events', JSON.stringify(initialEvents));
      }
    } catch (error) {
      console.error('Error loading data:', error);
      const initialEvents = getAllYearsData();
      setAllEvents(initialEvents);
    }
  };

  const getAllYearsData = () => {
    const events = [];
    
    // 2020 - Shai 19, Ronald 20
    for (let i = 0; i < 19; i++) {
      const week = Math.floor((i / 19) * 52);
      const date = new Date(2020, 0, 5 + (week * 7)).toISOString().split('T')[0];
      events.push({ date, player: 'shai', type: 'clase', year: '2020' });
    }
    for (let i = 0; i < 20; i++) {
      const week = Math.floor((i / 20) * 52);
      const date = new Date(2020, 0, 5 + (week * 7)).toISOString().split('T')[0];
      events.push({ date, player: 'ronald', type: 'clase', year: '2020' });
    }
    
    // 2021 - Shai 16, Ronald 16
    for (let i = 0; i < 16; i++) {
      const week = Math.floor((i / 16) * 52);
      const date = new Date(2021, 0, 5 + (week * 7)).toISOString().split('T')[0];
      events.push({ date, player: 'shai', type: 'clase', year: '2021' });
    }
    for (let i = 0; i < 16; i++) {
      const week = Math.floor((i / 16) * 52);
      const date = new Date(2021, 0, 5 + (week * 7)).toISOString().split('T')[0];
      events.push({ date, player: 'ronald', type: 'clase', year: '2021' });
    }
    
    // 2022 - Shai 15, Ronald 12
    for (let i = 0; i < 15; i++) {
      const week = Math.floor((i / 15) * 52);
      const date = new Date(2022, 0, 5 + (week * 7)).toISOString().split('T')[0];
      events.push({ date, player: 'shai', type: 'clase', year: '2022' });
    }
    for (let i = 0; i < 12; i++) {
      const week = Math.floor((i / 12) * 52);
      const date = new Date(2022, 0, 5 + (week * 7)).toISOString().split('T')[0];
      events.push({ date, player: 'ronald', type: 'clase', year: '2022' });
    }
    
    // 2023 - Datos completos
    const data2023 = [
      { date: '2023-01-13', shaiClase: 1, ronaldClase: 0 },
      { date: '2023-01-20', shaiClase: 1, ronaldClase: 0 },
      { date: '2023-01-27', shaiClase: 1, ronaldClase: 0 },
      { date: '2023-02-03', shaiClase: 0, ronaldClase: 1 },
      { date: '2023-02-10', shaiClase: 1, ronaldClase: 0 },
      { date: '2023-02-17', shaiClase: 0, ronaldClase: 1 },
      { date: '2023-02-24', shaiClase: 0, ronaldClase: 1 },
      { date: '2023-03-03', shaiClase: 0, ronaldClase: 1 },
      { date: '2023-03-10', shaiClase: 0, ronaldClase: 1 },
      { date: '2023-03-24', shaiClase: 1, ronaldClase: 0 },
      { date: '2023-03-31', shaiClase: 0, ronaldClase: 1 },
      { date: '2023-04-07', shaiClase: 1, ronaldClase: 0 },
      { date: '2023-04-14', shaiClase: 0, ronaldClase: 1 },
      { date: '2023-04-21', shaiClase: 1, ronaldClase: 0, shaiTarea: 1 },
      { date: '2023-04-28', shaiClase: 0, ronaldClase: 1 },
      { date: '2023-05-05', shaiClase: 0, ronaldClase: 1 },
      { date: '2023-05-12', shaiClase: 0, ronaldClase: 1 },
      { date: '2023-05-19', shaiClase: 0, ronaldClase: 1 },
      { date: '2023-05-26', shaiClase: 0, ronaldClase: 1 },
      { date: '2023-06-02', shaiClase: 0, ronaldClase: 1 },
      { date: '2023-06-09', shaiClase: 0, ronaldClase: 1 },
      { date: '2023-06-16', shaiClase: 1, ronaldClase: 0 },
      { date: '2023-06-23', shaiClase: 0, ronaldClase: 0, shaiTarea: 1 },
      { date: '2023-06-30', shaiClase: 1, ronaldClase: 0, shaiTarea: 1 },
      { date: '2023-07-07', shaiClase: 0, ronaldClase: 1 },
      { date: '2023-07-14', shaiClase: 0, ronaldClase: 1, shaiTarea: 1 },
      { date: '2023-07-21', shaiClase: 0, ronaldClase: 1, shaiTarea: 1 },
      { date: '2023-07-28', shaiClase: 1, ronaldClase: 0, shaiTarea: 1 },
      { date: '2023-08-04', shaiClase: 1, ronaldClase: 0, shaiTarea: 1 },
      { date: '2023-08-11', shaiClase: 1, ronaldClase: 0, shaiTarea: 1 },
      { date: '2023-08-18', shaiClase: 1, ronaldClase: 0, shaiTarea: 1 },
      { date: '2023-08-25', shaiClase: 1, ronaldClase: 0, shaiTarea: 1 },
      { date: '2023-09-01', shaiClase: 1, ronaldClase: 0, shaiTarea: 1 },
      { date: '2023-09-08', shaiClase: 1, ronaldClase: 0, shaiTarea: 1 },
      { date: '2023-09-15', shaiClase: 0, ronaldClase: 0, shaiTarea: 1 },
      { date: '2023-09-22', shaiClase: 1, ronaldClase: 0, shaiTarea: 1 },
      { date: '2023-09-29', shaiClase: 1, ronaldClase: 0, shaiTarea: 1 },
      { date: '2023-10-13', shaiClase: 1, ronaldClase: 0, shaiTarea: 1 },
      { date: '2023-10-20', shaiClase: 1, ronaldClase: 0, shaiTarea: 1 },
      { date: '2023-10-27', shaiClase: 1, ronaldClase: 0, shaiTarea: 1 },
      { date: '2023-11-03', shaiClase: 1, ronaldClase: 0, shaiTarea: 1 },
      { date: '2023-12-08', shaiClase: 1, ronaldClase: 0 },
      { date: '2023-12-15', shaiClase: 1, ronaldClase: 0, shaiTarea: 1 },
    ];

    data2023.forEach(week => {
      for (let i = 0; i < (week.shaiClase || 0); i++) {
        events.push({ date: week.date, player: 'shai', type: 'clase', year: '2023' });
      }
      for (let i = 0; i < (week.ronaldClase || 0); i++) {
        events.push({ date: week.date, player: 'ronald', type: 'clase', year: '2023' });
      }
      for (let i = 0; i < (week.shaiTarea || 0); i++) {
        events.push({ date: week.date, player: 'shai', type: 'tareaTerminada', year: '2023' });
      }
    });
    
    // 2024 - Datos completos
    const data2024 = [
      { date: '2024-01-26', shaiClase: 1, ronaldClase: 0, shaiTarea: 1, ronaldTarea: 0 },
      { date: '2024-02-02', shaiClase: 1, ronaldClase: 0 },
      { date: '2024-02-16', shaiClase: 0, ronaldClase: 1 },
      { date: '2024-02-23', shaiClase: 1, ronaldClase: 0, shaiTarea: 1 },
      { date: '2024-03-08', shaiClase: 0, ronaldClase: 1 },
      { date: '2024-03-22', shaiClase: 1, ronaldClase: 0 },
      { date: '2024-03-29', shaiClase: 1, ronaldClase: 0, shaiTarea: 1 },
      { date: '2024-04-05', shaiClase: 1, ronaldClase: 0 },
      { date: '2024-04-12', shaiClase: 0, ronaldClase: 1 },
      { date: '2024-04-19', shaiClase: 1, ronaldClase: 0, shaiTarea: 1 },
      { date: '2024-04-26', shaiClase: 0, ronaldClase: 1, shaiTarea: 1, ronaldTarea: 1 },
      { date: '2024-05-03', shaiClase: 1, ronaldClase: 0, shaiTarea: 1 },
      { date: '2024-05-10', shaiClase: 1, ronaldClase: 0, shaiTarea: 1 },
      { date: '2024-05-24', shaiClase: 1, ronaldClase: 0 },
      { date: '2024-06-07', shaiClase: 1, ronaldClase: 0 },
      { date: '2024-06-14', shaiClase: 0, ronaldClase: 1 },
      { date: '2024-06-21', shaiClase: 0, ronaldClase: 1 },
      { date: '2024-06-28', shaiClase: 0, ronaldClase: 1 },
      { date: '2024-07-05', shaiClase: 0, ronaldClase: 1 },
      { date: '2024-07-12', shaiClase: 1, ronaldClase: 0 },
      { date: '2024-07-19', shaiClase: 1, ronaldClase: 0 },
      { date: '2024-07-26', shaiClase: 1, ronaldClase: 0, ronaldTarea: 1 },
      { date: '2024-08-02', shaiClase: 1, ronaldClase: 0, ronaldTarea: 1 },
      { date: '2024-08-09', shaiClase: 1, ronaldClase: 0, shaiTarea: 1 },
      { date: '2024-09-06', shaiClase: 1, ronaldClase: 0 },
      { date: '2024-09-13', shaiClase: 1, ronaldClase: 0, ronaldTarea: 1 },
      { date: '2024-09-20', shaiClase: 0, ronaldClase: 1, shaiTarea: 1 },
      { date: '2024-10-04', shaiClase: 1, ronaldClase: 0, ronaldTarea: 1 },
      { date: '2024-12-06', shaiClase: 1, ronaldClase: 0 },
    ];

    data2024.forEach(week => {
      for (let i = 0; i < (week.shaiClase || 0); i++) {
        events.push({ date: week.date, player: 'shai', type: 'clase', year: '2024' });
      }
      for (let i = 0; i < (week.ronaldClase || 0); i++) {
        events.push({ date: week.date, player: 'ronald', type: 'clase', year: '2024' });
      }
      for (let i = 0; i < (week.shaiTarea || 0); i++) {
        events.push({ date: week.date, player: 'shai', type: 'tareaTerminada', year: '2024' });
      }
      for (let i = 0; i < (week.ronaldTarea || 0); i++) {
        events.push({ date: week.date, player: 'ronald', type: 'tareaCompletada', year: '2024' });
      }
    });

    return events;
  };

  const saveEvents = (newEvents) => {
    try {
      localStorage.setItem('shai-vs-ronald-events', JSON.stringify(newEvents));
      setAllEvents(newEvents);
    } catch (error) {
      console.error('Error saving:', error);
    }
  };

  const addPoint = (player, type) => {
    const today = new Date().toISOString().split('T')[0];
    const newEvent = { date: today, player, type, year: selectedYear };
    saveEvents([...allEvents, newEvent]);
  };

  const removePoint = (player, type) => {
    const filtered = allEvents.filter(e => 
      e.player === player && e.type === type && e.year === selectedYear
    );
    if (filtered.length > 0) {
      const lastEvent = filtered[filtered.length - 1];
      saveEvents(allEvents.filter(e => e !== lastEvent));
    }
  };

  const getChartData = () => {
    const yearEvents = allEvents
      .filter(e => e.year === selectedYear)
      .sort((a, b) => new Date(a.date) - new Date(b.date));

    if (yearEvents.length === 0) return [];

    const dataPoints = [];
    const dateGroups = {};
    
    yearEvents.forEach(event => {
      if (!dateGroups[event.date]) {
        dateGroups[event.date] = { shai: 0, ronald: 0 };
      }
    });

    const dates = Object.keys(dateGroups).sort();
    let shaiCumulative = 0;
    let ronaldCumulative = 0;

    dates.forEach(date => {
      yearEvents
        .filter(e => e.date === date)
        .forEach(e => {
          if (e.player === 'shai') shaiCumulative++;
          else ronaldCumulative++;
        });
      
      dataPoints.push({
        date,
        shai: shaiCumulative,
        ronald: ronaldCumulative
      });
    });

    return dataPoints;
  };

  const calculateYearStats = (year) => {
    const yearEvents = allEvents.filter(e => e.year === year);
    return {
      shai: {
        clase: yearEvents.filter(e => e.player === 'shai' && e.type === 'clase').length,
        tareaCompletada: yearEvents.filter(e => e.player === 'shai' && e.type === 'tareaCompletada').length,
        tareaTerminada: yearEvents.filter(e => e.player === 'shai' && e.type === 'tareaTerminada').length,
      },
      ronald: {
        clase: yearEvents.filter(e => e.player === 'ronald' && e.type === 'clase').length,
        tareaCompletada: yearEvents.filter(e => e.player === 'ronald' && e.type === 'tareaCompletada').length,
        tareaTerminada: yearEvents.filter(e => e.player === 'ronald' && e.type === 'tareaTerminada').length,
      }
    };
  };

  const calculateStats = () => {
    const current = calculateYearStats(selectedYear);
    const shaiTotal = current.shai.clase + current.shai.tareaCompletada + current.shai.tareaTerminada;
    const ronaldTotal = current.ronald.clase + current.ronald.tareaCompletada + current.ronald.tareaTerminada;
    const totalGames = shaiTotal + ronaldTotal;

    const shaiWinPct = totalGames > 0 ? ((shaiTotal / totalGames) * 100).toFixed(1) : 0;
    const ronaldWinPct = totalGames > 0 ? ((ronaldTotal / totalGames) * 100).toFixed(1) : 0;

    const years = ['2020', '2021', '2022', '2023', '2024', '2025', '2026'];
    let shaiTotalAllTime = 0;
    let ronaldTotalAllTime = 0;
    let shaiYearsWon = 0;
    let ronaldYearsWon = 0;

    years.forEach(year => {
      const yearStats = calculateYearStats(year);
      const shaiYearTotal = yearStats.shai.clase + yearStats.shai.tareaCompletada + yearStats.shai.tareaTerminada;
      const ronaldYearTotal = yearStats.ronald.clase + yearStats.ronald.tareaCompletada + yearStats.ronald.tareaTerminada;
      
      shaiTotalAllTime += shaiYearTotal;
      ronaldTotalAllTime += ronaldYearTotal;

      if (shaiYearTotal > ronaldYearTotal) shaiYearsWon++;
      else if (ronaldYearTotal > shaiYearTotal) ronaldYearsWon++;
    });

    return {
      current: { shaiTotal, ronaldTotal, totalGames, ...current },
      percentages: { shaiWinPct, ronaldWinPct },
      allTime: { shaiTotalAllTime, ronaldTotalAllTime, shaiYearsWon, ronaldYearsWon }
    };
  };

  const stats = calculateStats();
  const chartData = getChartData();
  const leader = stats.current.shaiTotal > stats.current.ronaldTotal ? 'shai' : stats.current.ronaldTotal > stats.current.shaiTotal ? 'ronald' : 'tie';

  const getMonthLabel = (dateStr) => {
    const date = new Date(dateStr);
    return date.toLocaleDateString('es-ES', { month: 'short' });
  };

  // Colores estilo Apple
  const colors = {
    shai: '#007AFF',
    ronald: '#FF3B30',
    background: '#F2F2F7',
    card: '#FFFFFF',
    text: '#000000',
    textSecondary: '#8E8E93',
    border: 'rgba(0, 0, 0, 0.1)'
  };

  const renderChart = () => {
    if (chartData.length === 0) {
      return (
        <div style={{ textAlign: 'center', padding: '60px 20px', color: colors.textSecondary }}>
          <div style={{ fontSize: '0.9rem' }}>No hay datos para {selectedYear}</div>
          <div style={{ fontSize: '0.8rem', marginTop: '8px' }}>Agrega puntos para ver el gráfico</div>
        </div>
      );
    }

    const width = 100;
    const height = 50;
    const maxValue = Math.max(
      chartData[chartData.length - 1]?.shai || 0,
      chartData[chartData.length - 1]?.ronald || 0
    );
    const padding = 8;

    const xScale = (index) => padding + (index / (chartData.length - 1)) * (width - padding * 2);
    const yScale = (value) => height - padding - ((value / maxValue) * (height - padding * 2));

    const shaiPoints = chartData.map((d, i) => `${xScale(i)},${yScale(d.shai)}`).join(' ');
    const ronaldPoints = chartData.map((d, i) => `${xScale(i)},${yScale(d.ronald)}`).join(' ');

    // Calcular posiciones de meses
    const months = [];
    let lastMonth = '';
    chartData.forEach((d, i) => {
      const month = getMonthLabel(d.date);
      if (month !== lastMonth) {
        months.push({ index: i, label: month });
        lastMonth = month;
      }
    });

    return (
      <div style={{ position: 'relative', width: '100%', height: '280px' }}>
        <svg 
          viewBox={`0 0 ${width} ${height}`} 
          style={{ width: '100%', height: '240px' }}
          preserveAspectRatio="none"
        >
          {/* Grid */}
          {[0, 0.5, 1].map(fraction => (
            <line
              key={fraction}
              x1={padding}
              y1={height - padding - fraction * (height - padding * 2)}
              x2={width - padding}
              y2={height - padding - fraction * (height - padding * 2)}
              stroke={colors.border}
              strokeWidth="0.15"
            />
          ))}

          {/* Líneas */}
          <polyline points={ronaldPoints} fill="none" stroke={colors.ronald} strokeWidth="0.8" strokeLinecap="round" strokeLinejoin="round" />
          <polyline points={shaiPoints} fill="none" stroke={colors.shai} strokeWidth="0.8" strokeLinecap="round" strokeLinejoin="round" />

          {/* Áreas */}
          <path d={`M ${padding},${height - padding} L ${shaiPoints} L ${xScale(chartData.length - 1)},${height - padding} Z`} fill={colors.shai} opacity="0.08" />
          <path d={`M ${padding},${height - padding} L ${ronaldPoints} L ${xScale(chartData.length - 1)},${height - padding} Z`} fill={colors.ronald} opacity="0.08" />

          {/* Puntos */}
          {chartData.map((d, i) => (
            <g key={i}>
              <circle cx={xScale(i)} cy={yScale(d.shai)} r="0.6" fill={colors.shai} />
              <circle cx={xScale(i)} cy={yScale(d.ronald)} r="0.6" fill={colors.ronald} />
            </g>
          ))}
        </svg>

        {/* Eje X - Meses */}
        <div style={{
          position: 'absolute',
          bottom: '0',
          left: '0',
          right: '0',
          height: '40px',
          display: 'flex',
          justifyContent: 'space-between',
          paddingLeft: `${padding}%`,
          paddingRight: `${padding}%`,
          fontSize: '0.7rem',
          color: colors.textSecondary
        }}>
          {months.map((m, idx) => (
            <div key={idx} style={{
              position: 'absolute',
              left: `${padding + (m.index / (chartData.length - 1)) * (100 - padding * 2)}%`,
              transform: 'translateX(-50%)'
            }}>
              {m.label}
            </div>
          ))}
        </div>
      </div>
    );
  };

  return (
    <div style={{
      minHeight: '100vh',
      background: colors.background,
      padding: '20px',
      fontFamily: "-apple-system, BlinkMacSystemFont, 'SF Pro Display', sans-serif",
      color: colors.text
    }}>
      {/* Header */}
      <div style={{ textAlign: 'center', marginBottom: '24px', position: 'relative' }}>
        <button onClick={() => setShowStats(!showStats)} style={{
          position: 'absolute',
          right: '0',
          top: '10px',
          background: colors.card,
          border: `1px solid ${colors.border}`,
          borderRadius: '10px',
          padding: '8px 12px',
          color: colors.shai,
          cursor: 'pointer',
          display: 'flex',
          alignItems: 'center',
          gap: '6px',
          fontSize: '13px',
          fontWeight: '600'
        }}>
          <BarChart3 size={16} />
          Stats
        </button>

        <Trophy size={32} style={{ marginBottom: '8px', color: '#FFD700' }} />
        <h1 style={{ fontSize: '2rem', fontWeight: '700', margin: '8px 0', letterSpacing: '-0.5px' }}>
          Shai vs. Ronald
        </h1>
        
        {/* Year Selector */}
        <div style={{ display: 'flex', gap: '6px', justifyContent: 'center', flexWrap: 'wrap', marginTop: '16px' }}>
          {['2020', '2021', '2022', '2023', '2024', '2025', '2026'].map(year => (
            <button key={year} onClick={() => setSelectedYear(year)} style={{
              background: selectedYear === year ? colors.shai : colors.card,
              border: `1px solid ${selectedYear === year ? colors.shai : colors.border}`,
              borderRadius: '10px',
              padding: '8px 16px',
              color: selectedYear === year ? '#fff' : colors.text,
              cursor: 'pointer',
              fontWeight: '600',
              fontSize: '14px'
            }}>
              {year}
            </button>
          ))}
        </div>
      </div>

      {/* Gráfico */}
      <div style={{
        background: colors.card,
        borderRadius: '16px',
        padding: '20px',
        marginBottom: '16px',
        boxShadow: '0 1px 3px rgba(0,0,0,0.1)'
      }}>
        {renderChart()}
      </div>

      {/* Stats */}
      {showStats && (
        <div style={{
          background: colors.card,
          borderRadius: '16px',
          padding: '20px',
          marginBottom: '16px',
          boxShadow: '0 1px 3px rgba(0,0,0,0.1)'
        }}>
          <h3 style={{ marginBottom: '16px', fontSize: '1.1rem', fontWeight: '600' }}>
            Estadísticas {selectedYear}
          </h3>
          
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px', marginBottom: '16px' }}>
            <div style={{
              background: `rgba(0, 122, 255, 0.1)`,
              padding: '16px',
              borderRadius: '12px',
              border: `1px solid ${colors.shai}`
            }}>
              <div style={{ fontSize: '0.85rem', color: colors.textSecondary, marginBottom: '4px' }}>Shai</div>
              <div style={{ fontSize: '2rem', fontWeight: '700', color: colors.shai }}>{stats.percentages.shaiWinPct}%</div>
              <div style={{ fontSize: '0.75rem', color: colors.textSecondary, marginTop: '4px' }}>
                {stats.current.shaiTotal} puntos
              </div>
            </div>
            <div style={{
              background: `rgba(255, 59, 48, 0.1)`,
              padding: '16px',
              borderRadius: '12px',
              border: `1px solid ${colors.ronald}`
            }}>
              <div style={{ fontSize: '0.85rem', color: colors.textSecondary, marginBottom: '4px' }}>Ronald</div>
              <div style={{ fontSize: '2rem', fontWeight: '700', color: colors.ronald }}>{stats.percentages.ronaldWinPct}%</div>
              <div style={{ fontSize: '0.75rem', color: colors.textSecondary, marginTop: '4px' }}>
                {stats.current.ronaldTotal} puntos
              </div>
            </div>
          </div>

          <div style={{ 
            paddingTop: '16px', 
            borderTop: `1px solid ${colors.border}`,
            fontSize: '0.85rem',
            color: colors.textSecondary
          }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px' }}>
              <span>Récord histórico</span>
              <span style={{ fontWeight: '600', color: colors.text }}>
                {stats.allTime.shaiTotalAllTime} - {stats.allTime.ronaldTotalAllTime}
              </span>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between' }}>
              <span>Años ganados</span>
              <span style={{ fontWeight: '600', color: colors.text }}>
                Shai {stats.allTime.shaiYearsWon} - {stats.allTime.ronaldYearsWon} Ronald
              </span>
            </div>
          </div>
        </div>
      )}

      {/* Marcador */}
      <div style={{
        background: colors.card,
        borderRadius: '16px',
        padding: '20px',
        marginBottom: '16px',
        boxShadow: '0 1px 3px rgba(0,0,0,0.1)'
      }}>
        {leader !== 'tie' && (
          <div style={{
            textAlign: 'center',
            marginBottom: '16px',
            padding: '12px',
            background: leader === 'shai' ? 'rgba(0,122,255,0.1)' : 'rgba(255,59,48,0.1)',
            borderRadius: '12px',
            border: `1px solid ${leader === 'shai' ? colors.shai : colors.ronald}`,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: '8px'
          }}>
            <Award size={20} style={{ color: leader === 'shai' ? colors.shai : colors.ronald }} />
            <span style={{ fontSize: '0.95rem', fontWeight: '600', color: leader === 'shai' ? colors.shai : colors.ronald }}>
              {leader === 'shai' ? 'Shai' : 'Ronald'} lidera por {Math.abs(stats.current.shaiTotal - stats.current.ronaldTotal)}
            </span>
          </div>
        )}

        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
          <div style={{ textAlign: 'center' }}>
            <div style={{ fontSize: '0.85rem', color: colors.textSecondary, marginBottom: '8px', fontWeight: '500' }}>
              Shai
            </div>
            <div style={{ fontSize: '3rem', fontWeight: '700', color: colors.shai }}>
              {stats.current.shaiTotal}
            </div>
          </div>

          <div style={{ textAlign: 'center' }}>
            <div style={{ fontSize: '0.85rem', color: colors.textSecondary, marginBottom: '8px', fontWeight: '500' }}>
              Ronald
            </div>
            <div style={{ fontSize: '3rem', fontWeight: '700', color: colors.ronald }}>
              {stats.current.ronaldTotal}
            </div>
          </div>
        </div>
      </div>

      {/* Llegó a Tiempo */}
      <div style={{
        background: colors.card,
        borderRadius: '16px',
        padding: '18px',
        marginBottom: '12px',
        boxShadow: '0 1px 3px rgba(0,0,0,0.1)'
      }}>
        <h3 style={{ marginBottom: '14px', fontSize: '1rem', fontWeight: '600', display: 'flex', alignItems: 'center', gap: '8px' }}>
          <Clock size={18} />
          Llegó a Tiempo
        </h3>
        
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px' }}>
          <div>
            <div style={{
              background: `rgba(0, 122, 255, 0.1)`,
              borderRadius: '10px',
              padding: '10px',
              textAlign: 'center',
              marginBottom: '8px',
              border: `1px solid ${colors.shai}`
            }}>
              <div style={{ fontSize: '0.8rem', marginBottom: '4px', fontWeight: '500', color: colors.textSecondary }}>Shai</div>
              <div style={{ fontSize: '2rem', fontWeight: '700', color: colors.shai }}>{stats.current.shai.clase}</div>
            </div>
            <div style={{ display: 'flex', gap: '6px' }}>
              <button onClick={() => addPoint('shai', 'clase')} style={{
                flex: 1,
                background: colors.shai,
                border: 'none',
                borderRadius: '10px',
                padding: '12px',
                color: '#fff',
                cursor: 'pointer',
                fontWeight: '600',
                fontSize: '0.9rem',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '6px'
              }}>
                <Plus size={16} />
                Agregar
              </button>
              <button onClick={() => removePoint('shai', 'clase')} style={{
                width: '44px',
                background: colors.background,
                border: `1px solid ${colors.border}`,
                borderRadius: '10px',
                padding: '12px',
                color: colors.text,
                cursor: 'pointer',
                fontWeight: '600',
                fontSize: '1rem'
              }}>
                −
              </button>
            </div>
          </div>

          <div>
            <div style={{
              background: `rgba(255, 59, 48, 0.1)`,
              borderRadius: '10px',
              padding: '10px',
              textAlign: 'center',
              marginBottom: '8px',
              border: `1px solid ${colors.ronald}`
            }}>
              <div style={{ fontSize: '0.8rem', marginBottom: '4px', fontWeight: '500', color: colors.textSecondary }}>Ronald</div>
              <div style={{ fontSize: '2rem', fontWeight: '700', color: colors.ronald }}>{stats.current.ronald.clase}</div>
            </div>
            <div style={{ display: 'flex', gap: '6px' }}>
              <button onClick={() => addPoint('ronald', 'clase')} style={{
                flex: 1,
                background: colors.ronald,
                border: 'none',
                borderRadius: '10px',
                padding: '12px',
                color: '#fff',
                cursor: 'pointer',
                fontWeight: '600',
                fontSize: '0.9rem',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '6px'
              }}>
                <Plus size={16} />
                Agregar
              </button>
              <button onClick={() => removePoint('ronald', 'clase')} style={{
                width: '44px',
                background: colors.background,
                border: `1px solid ${colors.border}`,
                borderRadius: '10px',
                padding: '12px',
                color: colors.text,
                cursor: 'pointer',
                fontWeight: '600',
                fontSize: '1rem'
              }}>
                −
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Empezó la Tarea */}
      <div style={{
        background: colors.card,
        borderRadius: '16px',
        padding: '18px',
        marginBottom: '12px',
        boxShadow: '0 1px 3px rgba(0,0,0,0.1)'
      }}>
        <h3 style={{ marginBottom: '14px', fontSize: '1rem', fontWeight: '600', display: 'flex', alignItems: 'center', gap: '8px' }}>
          <Calendar size={18} />
          Empezó la Tarea
        </h3>
        
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px' }}>
          <div>
            <div style={{
              background: `rgba(0, 122, 255, 0.1)`,
              borderRadius: '10px',
              padding: '10px',
              textAlign: 'center',
              marginBottom: '8px',
              border: `1px solid ${colors.shai}`
            }}>
              <div style={{ fontSize: '0.8rem', marginBottom: '4px', fontWeight: '500', color: colors.textSecondary }}>Shai</div>
              <div style={{ fontSize: '2rem', fontWeight: '700', color: colors.shai }}>{stats.current.shai.tareaCompletada}</div>
            </div>
            <div style={{ display: 'flex', gap: '6px' }}>
              <button onClick={() => addPoint('shai', 'tareaCompletada')} style={{
                flex: 1,
                background: colors.shai,
                border: 'none',
                borderRadius: '10px',
                padding: '12px',
                color: '#fff',
                cursor: 'pointer',
                fontWeight: '600',
                fontSize: '0.9rem',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '6px'
              }}>
                <Plus size={16} />
                Agregar
              </button>
              <button onClick={() => removePoint('shai', 'tareaCompletada')} style={{
                width: '44px',
                background: colors.background,
                border: `1px solid ${colors.border}`,
                borderRadius: '10px',
                padding: '12px',
                color: colors.text,
                cursor: 'pointer',
                fontWeight: '600',
                fontSize: '1rem'
              }}>
                −
              </button>
            </div>
          </div>

          <div>
            <div style={{
              background: `rgba(255, 59, 48, 0.1)`,
              borderRadius: '10px',
              padding: '10px',
              textAlign: 'center',
              marginBottom: '8px',
              border: `1px solid ${colors.ronald}`
            }}>
              <div style={{ fontSize: '0.8rem', marginBottom: '4px', fontWeight: '500', color: colors.textSecondary }}>Ronald</div>
              <div style={{ fontSize: '2rem', fontWeight: '700', color: colors.ronald }}>{stats.current.ronald.tareaCompletada}</div>
            </div>
            <div style={{ display: 'flex', gap: '6px' }}>
              <button onClick={() => addPoint('ronald', 'tareaCompletada')} style={{
                flex: 1,
                background: colors.ronald,
                border: 'none',
                borderRadius: '10px',
                padding: '12px',
                color: '#fff',
                cursor: 'pointer',
                fontWeight: '600',
                fontSize: '0.9rem',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '6px'
              }}>
                <Plus size={16} />
                Agregar
              </button>
              <button onClick={() => removePoint('ronald', 'tareaCompletada')} style={{
                width: '44px',
                background: colors.background,
                border: `1px solid ${colors.border}`,
                borderRadius: '10px',
                padding: '12px',
                color: colors.text,
                cursor: 'pointer',
                fontWeight: '600',
                fontSize: '1rem'
              }}>
                −
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Terminó la Tarea */}
      <div style={{
        background: colors.card,
        borderRadius: '16px',
        padding: '18px',
        marginBottom: '12px',
        boxShadow: '0 1px 3px rgba(0,0,0,0.1)'
      }}>
        <h3 style={{ marginBottom: '14px', fontSize: '1rem', fontWeight: '600', display: 'flex', alignItems: 'center', gap: '8px' }}>
          <CheckCircle2 size={18} />
          Terminó la Tarea
        </h3>
        
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px' }}>
          <div>
            <div style={{
              background: `rgba(0, 122, 255, 0.1)`,
              borderRadius: '10px',
              padding: '10px',
              textAlign: 'center',
              marginBottom: '8px',
              border: `1px solid ${colors.shai}`
            }}>
              <div style={{ fontSize: '0.8rem', marginBottom: '4px', fontWeight: '500', color: colors.textSecondary }}>Shai</div>
              <div style={{ fontSize: '2rem', fontWeight: '700', color: colors.shai }}>{stats.current.shai.tareaTerminada}</div>
            </div>
            <div style={{ display: 'flex', gap: '6px' }}>
              <button onClick={() => addPoint('shai', 'tareaTerminada')} style={{
                flex: 1,
                background: colors.shai,
                border: 'none',
                borderRadius: '10px',
                padding: '12px',
                color: '#fff',
                cursor: 'pointer',
                fontWeight: '600',
                fontSize: '0.9rem',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '6px'
              }}>
                <Plus size={16} />
                Agregar
              </button>
              <button onClick={() => removePoint('shai', 'tareaTerminada')} style={{
                width: '44px',
                background: colors.background,
                border: `1px solid ${colors.border}`,
                borderRadius: '10px',
                padding: '12px',
                color: colors.text,
                cursor: 'pointer',
                fontWeight: '600',
                fontSize: '1rem'
              }}>
                −
              </button>
            </div>
          </div>

          <div>
            <div style={{
              background: `rgba(255, 59, 48, 0.1)`,
              borderRadius: '10px',
              padding: '10px',
              textAlign: 'center',
              marginBottom: '8px',
              border: `1px solid ${colors.ronald}`
            }}>
              <div style={{ fontSize: '0.8rem', marginBottom: '4px', fontWeight: '500', color: colors.textSecondary }}>Ronald</div>
              <div style={{ fontSize: '2rem', fontWeight: '700', color: colors.ronald }}>{stats.current.ronald.tareaTerminada}</div>
            </div>
            <div style={{ display: 'flex', gap: '6px' }}>
              <button onClick={() => addPoint('ronald', 'tareaTerminada')} style={{
                flex: 1,
                background: colors.ronald,
                border: 'none',
                borderRadius: '10px',
                padding: '12px',
                color: '#fff',
                cursor: 'pointer',
                fontWeight: '600',
                fontSize: '0.9rem',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '6px'
              }}>
                <Plus size={16} />
                Agregar
              </button>
              <button onClick={() => removePoint('ronald', 'tareaTerminada')} style={{
                width: '44px',
                background: colors.background,
                border: `1px solid ${colors.border}`,
                borderRadius: '10px',
                padding: '12px',
                color: colors.text,
                cursor: 'pointer',
                fontWeight: '600',
                fontSize: '1rem'
              }}>
                −
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}