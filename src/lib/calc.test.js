import { describe, it, expect } from 'vitest';
import { rupeesToPaise, paiseToInput, formatINR } from './money';
import { calculateMonth, buildHistory } from './calc';
import { addMonths, currentMonthKey, formatMonth, lastDayOfMonth, monthKeyOf, monthRange } from './dates';

const members = ['Shivuu', 'Ankush', 'Shashi', 'Tushar'].map((name, i) => ({
  id: `m${i + 1}`, name, active_from: null, active_until: null,
}));
const exp = (id, paid_by, rupees, date) => ({
  id, paid_by, amount_paise: rupeesToPaise(rupees), expense_date: date,
});

describe('money', () => {
  it('parses rupees into paise without float errors', () => {
    expect(rupeesToPaise('0.1')).toBe(10);
    expect(rupeesToPaise('19.99')).toBe(1999);
    expect(rupeesToPaise('1,250.5')).toBe(125050);
    expect(rupeesToPaise('1000')).toBe(100000);
    expect(rupeesToPaise('1.234')).toBeNull();
    expect(rupeesToPaise('abc')).toBeNull();
    expect(rupeesToPaise('-5')).toBeNull();
  });
  it('formats with Indian grouping', () => {
    expect(formatINR(12505000)).toBe('₹1,25,050.00');
    expect(formatINR(-50)).toBe('-₹0.50');
    expect(formatINR(0)).toBe('₹0.00');
    expect(paiseToInput(125050)).toBe('1250.50');
  });
});

describe('monthly calculation (4 roommates)', () => {
  const nov = [
    exp('1', 'm1', '4000', '2026-11-02'),
    exp('2', 'm2', '1000', '2026-11-05'),
    exp('3', 'm3', '2000', '2026-11-09'),
    exp('4', 'm1', '1000', '2026-11-30'),
  ];
  const r = calculateMonth(nov, members, '2026-11');

  it('total, per head', () => {
    expect(r.total).toBe(800000);
    expect(r.count).toBe(4);
    expect(r.perHead).toBe(200000);
  });
  it('balances = paid - per head', () => {
    const by = Object.fromEntries(r.rows.map((x) => [x.name, x]));
    expect(by.Shivuu.paid).toBe(500000);
    expect(by.Shivuu.balance).toBe(300000);
    expect(by.Shivuu.status).toBe('receive');
    expect(by.Ankush.balance).toBe(-100000);
    expect(by.Ankush.status).toBe('pay');
    expect(by.Shashi.balance).toBe(0);
    expect(by.Shashi.status).toBe('settled');
    expect(by.Tushar.balance).toBe(-200000);
  });
  it('balances always sum to exactly zero, even with odd paise', () => {
    const odd = [exp('a', 'm1', '100.01', '2026-11-01'), exp('b', 'm2', '0.02', '2026-11-02')];
    const o = calculateMonth(odd, members, '2026-11');
    expect(o.total).toBe(10003);
    expect(o.rows.reduce((s, x) => s + x.balance, 0)).toBe(0);
    expect(o.rows.reduce((s, x) => s + x.share, 0)).toBe(10003);
  });
  it('uses the actual active member count when it changes', () => {
    const three = members.map((m) => (m.id === 'm4' ? { ...m, active_until: '2026-11-01' } : m));
    const t = calculateMonth([exp('x', 'm1', '300', '2026-11-03')], three, '2026-11');
    expect(t.count).toBe(3);
    expect(t.perHead).toBe(10000);
    // ...but October (before they left) still has all four
    const oct = calculateMonth([exp('y', 'm1', '400', '2026-10-03')], three, '2026-10');
    expect(oct.count).toBe(4);
    expect(oct.perHead).toBe(10000);
  });
  it('an empty month is all zeros', () => {
    const e = calculateMonth([], members, '2026-12');
    expect(e.total).toBe(0);
    expect(e.perHead).toBe(0);
    expect(e.rows.every((x) => x.paid === 0 && x.balance === 0)).toBe(true);
  });
});

describe('month transitions (date filtering, nothing deleted)', () => {
  const all = [
    exp('1', 'm1', '1000', '2026-10-31'),
    exp('2', 'm2', '2000', '2026-11-01'),
    exp('3', 'm3', '500', '2026-11-30'),
    exp('4', 'm4', '800', '2026-12-01'),
  ];
  const forMonth = (k) => all.filter((e) => monthKeyOf(e.expense_date) === k);

  it('boundary days land in the right month', () => {
    expect(forMonth('2026-10').map((e) => e.id)).toEqual(['1']);
    expect(forMonth('2026-11').map((e) => e.id)).toEqual(['2', '3']);
    expect(forMonth('2026-12').map((e) => e.id)).toEqual(['4']);
  });
  it('a brand-new month starts at zero and old months keep their numbers', () => {
    expect(calculateMonth(forMonth('2027-01'), members, '2027-01').total).toBe(0);
    expect(calculateMonth(forMonth('2026-11'), members, '2026-11').total).toBe(250000);
    expect(all).toHaveLength(4); // nothing removed
  });
  it('date helpers', () => {
    expect(addMonths('2026-12', 1)).toBe('2027-01');
    expect(addMonths('2026-01', -1)).toBe('2025-12');
    expect(lastDayOfMonth('2028-02')).toBe('2028-02-29');
    expect(formatMonth('2026-11')).toBe('November 2026');
    expect(monthRange('2026-11', '2027-02')).toEqual(['2026-11', '2026-12', '2027-01', '2027-02']);
    expect(currentMonthKey(new Date(2026, 10, 7))).toBe('2026-11');
  });
  it('history lists every month through the current one, newest first, including empty ones', () => {
    const h = buildHistory(all.slice(0, 3), members, '2027-01');
    expect(h.map((x) => x.key)).toEqual(['2027-01', '2026-12', '2026-11', '2026-10']);
    expect(h.map((x) => x.total)).toEqual([0, 0, 250000, 100000]);
  });
});
