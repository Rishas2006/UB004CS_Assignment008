/** Pure slot logic (unit tested). Times are 'HH:MM' strings. */
const toMin = (t) => { const [h, m] = t.split(':').map(Number); return h * 60 + m; };
const toHHMM = (n) => `${String(Math.floor(n / 60)).padStart(2, '0')}:${String(n % 60).padStart(2, '0')}`;

/**
 * schedules: [{ start_time:'09:00', end_time:'12:00', slot_minutes:15 }] for ONE weekday
 * booked:    array of 'HH:MM' already taken
 * returns:   [{ time:'09:00', available:true|false }]
 */
function buildSlots(schedules, booked = [], { now = null, dateStr = null } = {}) {
  const taken = new Set(booked.map((t) => t.slice(0, 5)));
  const out = [];
  for (const s of schedules) {
    const step = s.slot_minutes || 15;
    for (let m = toMin(s.start_time.slice(0, 5)); m + step <= toMin(s.end_time.slice(0, 5)); m += step) {
      const time = toHHMM(m);
      let available = !taken.has(time);
      // hide slots that have already passed today (Sri Lanka time is handled by caller via `now`)
      if (available && now && dateStr && dateStr === now.date && m <= toMin(now.time)) available = false;
      out.push({ time, available });
    }
  }
  return out.sort((a, b) => a.time.localeCompare(b.time));
}

/** Earliest available slot across a list of days: [{date, slots}] -> {date,time}|null */
function earliest(days) {
  for (const d of days) {
    const s = d.slots.find((x) => x.available);
    if (s) return { date: d.date, time: s.time };
  }
  return null;
}
module.exports = { buildSlots, earliest, toMin, toHHMM };
