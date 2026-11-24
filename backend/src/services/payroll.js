/** Pure payroll calculation (Sri Lanka EPF/ETF rates). All money rounded to 2 decimals. */
const r2 = (n) => Math.round((n + Number.EPSILON) * 100) / 100;
const RATES = { epfEmployee: 0.08, epfEmployer: 0.12, etfEmployer: 0.03 };

/**
 * @param {{basic_salary:number, allowances:number}} staff
 * @param {{unpaidDays?:number, advances?:number}} opts
 */
function computePayroll(staff, { unpaidDays = 0, advances = 0 } = {}) {
  const basic = Number(staff.basic_salary);
  const allowances = Number(staff.allowances || 0);
  const epfEmployee = r2(basic * RATES.epfEmployee);
  const epfEmployer = r2(basic * RATES.epfEmployer);
  const etfEmployer = r2(basic * RATES.etfEmployer);
  const unpaid = r2((basic / 30) * unpaidDays);
  const adv = r2(advances);
  const net = r2(basic + allowances - epfEmployee - unpaid - adv);
  return { basic, allowances, epfEmployee, epfEmployer, etfEmployer, unpaidLeaveDeduction: unpaid, advanceDeduction: adv, net };
}
module.exports = { computePayroll, RATES };
