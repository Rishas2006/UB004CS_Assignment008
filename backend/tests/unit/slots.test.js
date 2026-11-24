const { buildSlots, earliest, toMin, toHHMM } = require('../../src/services/slots');

describe('slot generation', () => {
  const sch = [{ start_time: '09:00:00', end_time: '10:00:00', slot_minutes: 15 }];
  test('creates 15 minute slots inside the schedule window', () => {
    const s = buildSlots(sch);
    expect(s).toHaveLength(4);
    expect(s[0].time).toBe('09:00');
    expect(s[3].time).toBe('09:45');
  });
  test('marks booked times as unavailable', () => {
    const s = buildSlots(sch, ['09:15:00']);
    expect(s.find((x) => x.time === '09:15').available).toBe(false);
    expect(s.find((x) => x.time === '09:30').available).toBe(true);
  });
  test('hides slots that already passed today', () => {
    const s = buildSlots(sch, [], { now: { date: '2026-11-16', time: '09:20' }, dateStr: '2026-11-16' });
    expect(s.filter((x) => x.available).map((x) => x.time)).toEqual(['09:30', '09:45']);
  });
  test('does not hide slots on future days', () => {
    const s = buildSlots(sch, [], { now: { date: '2026-11-16', time: '23:00' }, dateStr: '2026-11-17' });
    expect(s.every((x) => x.available)).toBe(true);
  });
  test('supports split sessions in one day', () => {
    const s = buildSlots([{ start_time: '09:00', end_time: '09:30', slot_minutes: 15 }, { start_time: '14:00', end_time: '14:30', slot_minutes: 15 }]);
    expect(s.map((x) => x.time)).toEqual(['09:00', '09:15', '14:00', '14:15']);
  });
  test('returns no slots when the doctor does not work that day', () => { expect(buildSlots([])).toEqual([]); });
  test('earliest() finds the first free slot across days', () => {
    const days = [{ date: 'a', slots: [{ time: '09:00', available: false }] }, { date: 'b', slots: [{ time: '10:00', available: true }] }];
    expect(earliest(days)).toEqual({ date: 'b', time: '10:00' });
    expect(earliest([{ date: 'a', slots: [] }])).toBe(null);
  });
  test('time helpers round-trip', () => { expect(toHHMM(toMin('13:45'))).toBe('13:45'); });
});
