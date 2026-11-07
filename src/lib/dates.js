// A "month key" is a string like "2026-11". Expense dates are "YYYY-MM-DD" strings,
// so an expense belongs to a month simply by its first 7 characters.
// This is the whole monthly "reset": a new month key simply matches no old rows.

const MONTHS = [
  'January', 'February', 'March', 'April', 'May', 'June',
  'July', 'August', 'September', 'October', 'November', 'December',
];

const pad = (n) => String(n).padStart(2, '0');

export const monthNames = MONTHS;

export function todayISO(now = new Date()) {
  return `${now.getFullYear()}-${pad(now.getMonth() + 1)}-${pad(now.getDate())}`;
}

export function currentMonthKey(now = new Date()) {
  return todayISO(now).slice(0, 7);
}

export const monthKeyOf = (isoDate) => String(isoDate).slice(0, 7);

export function parseMonthKey(key) {
  const [y, m] = key.split('-').map(Number);
  return { year: y, month: m }; // month is 1-12
}

export const makeMonthKey = (year, month) => `${year}-${pad(month)}`;

export function addMonths(key, delta) {
  const { year, month } = parseMonthKey(key);
  const idx = year * 12 + (month - 1) + delta;
  return makeMonthKey(Math.floor(idx / 12), (idx % 12) + 1);
}

export function formatMonth(key) {
  const { year, month } = parseMonthKey(key);
  return `${MONTHS[month - 1]} ${year}`;
}

export function formatMonthShort(key) {
  const { year, month } = parseMonthKey(key);
  return `${MONTHS[month - 1].slice(0, 3)} ${String(year).slice(2)}`;
}

export const firstDayOfMonth = (key) => `${key}-01`;

export function lastDayOfMonth(key) {
  const { year, month } = parseMonthKey(key);
  const last = new Date(year, month, 0).getDate();
  return `${key}-${pad(last)}`;
}

/** Every month key from `from` to `to`, ascending, inclusive. */
export function monthRange(from, to) {
  const out = [];
  let k = from;
  while (k <= to) {
    out.push(k);
    k = addMonths(k, 1);
  }
  return out;
}

/** "2026-11-07" -> "07 Nov 2026" */
export function formatDate(iso) {
  const [y, m, d] = String(iso).split('-').map(Number);
  return `${pad(d)} ${MONTHS[m - 1].slice(0, 3)} ${y}`;
}
