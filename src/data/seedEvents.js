export const SEED_VERSION = '2026-02-24-1';

function isoDateUtc(year, monthIndex, day) {
  return new Date(Date.UTC(year, monthIndex, day)).toISOString().slice(0, 10);
}

function distributedDate(year, total, index) {
  const week = Math.floor((index / total) * 52);
  return isoDateUtc(year, 0, 5 + week * 7);
}

function seedTimestamp(date, sequence) {
  const minutes = String(Math.floor(sequence / 60) % 60).padStart(2, '0');
  const seconds = String(sequence % 60).padStart(2, '0');
  return `${date}T12:${minutes}:${seconds}.000Z`;
}

export function createSeedEvents() {
  const events = [];
  let sequence = 0;

  const push = (date, player, type) => {
    events.push({
      id: `seed-${SEED_VERSION}-${sequence}`,
      eventDate: date,
      year: date.slice(0, 4),
      player,
      type,
      source: 'seed',
      note: '',
      createdAt: seedTimestamp(date, sequence),
    });
    sequence += 1;
  };

  const addDistributedYear = (year, shaiTotal, ronaldTotal) => {
    for (let i = 0; i < shaiTotal; i += 1) {
      push(distributedDate(year, shaiTotal, i), 'shai', 'clase');
    }
    for (let i = 0; i < ronaldTotal; i += 1) {
      push(distributedDate(year, ronaldTotal, i), 'ronald', 'clase');
    }
  };

  addDistributedYear(2020, 19, 20);
  addDistributedYear(2021, 16, 16);
  addDistributedYear(2022, 15, 12);

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

  data2023.forEach((week) => {
    for (let i = 0; i < (week.shaiClase || 0); i += 1) {
      push(week.date, 'shai', 'clase');
    }
    for (let i = 0; i < (week.ronaldClase || 0); i += 1) {
      push(week.date, 'ronald', 'clase');
    }
    for (let i = 0; i < (week.shaiTarea || 0); i += 1) {
      push(week.date, 'shai', 'tareaTerminada');
    }
  });

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

  data2024.forEach((week) => {
    for (let i = 0; i < (week.shaiClase || 0); i += 1) {
      push(week.date, 'shai', 'clase');
    }
    for (let i = 0; i < (week.ronaldClase || 0); i += 1) {
      push(week.date, 'ronald', 'clase');
    }
    for (let i = 0; i < (week.shaiTarea || 0); i += 1) {
      push(week.date, 'shai', 'tareaTerminada');
    }
    for (let i = 0; i < (week.ronaldTarea || 0); i += 1) {
      push(week.date, 'ronald', 'tareaCompletada');
    }
  });

  return events.sort((a, b) => {
    const byDate = a.eventDate.localeCompare(b.eventDate);
    if (byDate !== 0) return byDate;
    return a.id.localeCompare(b.id);
  });
}

