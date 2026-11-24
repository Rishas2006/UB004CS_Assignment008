const { computePayroll } = require('../../src/services/payroll');

describe('payroll (EPF / ETF)', () => {
  test('calculates statutory contributions on basic salary', () => {
    const p = computePayroll({ basic_salary: 100000, allowances: 5000 });
    expect(p.epfEmployee).toBe(8000);
    expect(p.epfEmployer).toBe(12000);
    expect(p.etfEmployer).toBe(3000);
    expect(p.net).toBe(97000); // 100000 + 5000 - 8000
  });
  test('deducts unpaid leave (basic / 30 per day) and salary advances', () => {
    const p = computePayroll({ basic_salary: 100000, allowances: 5000 }, { unpaidDays: 2, advances: 5000 });
    expect(p.unpaidLeaveDeduction).toBeCloseTo(6666.67, 2);
    expect(p.advanceDeduction).toBe(5000);
    expect(p.net).toBeCloseTo(85333.33, 2);
  });
  test('handles missing allowances', () => { expect(computePayroll({ basic_salary: 50000 }).net).toBe(46000); });
});
