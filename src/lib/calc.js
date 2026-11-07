// Single source of truth for every number shown on BOTH pages.
import { monthKeyOf, monthRange, currentMonthKey } from './dates';

/** Did this member take part in the split for the given month? */
export function isActiveInMonth(member, key) {
  if (member.active_from && monthKeyOf(member.active_from) > key) return false;
  if (member.active_until && monthKeyOf(member.active_until) <= key) return false;
  return true;
}

/**
 * Calculates one month.
 *  - participants = members active that month, plus anyone who paid an expense that month
 *  - per head = total / participant count   (4 by default, actual count if it changes)
 *  - balance  = paid - share  (+ receives, - pays)
 * Everything is integer paise. When total doesn't divide evenly, the leftover
 * paise (< count) are handed one each to the first members, so balances always sum to exactly 0.
 */
export function calculateMonth(expenses, members, key) {
  const paidMap = new Map();
  let total = 0;
  for (const e of expenses) {
    total += e.amount_paise;
    paidMap.set(e.paid_by, (paidMap.get(e.paid_by) || 0) + e.amount_paise);
  }

  const participants = members.filter((m) => isActiveInMonth(m, key) || paidMap.has(m.id));
  const count = participants.length;
  const base = count ? Math.floor(total / count) : 0;
  const remainder = count ? total % count : 0;

  const rows = participants.map((m, i) => {
    const paid = paidMap.get(m.id) || 0;
    const share = base + (i < remainder ? 1 : 0);
    const balance = paid - share;
    return {
      id: m.id,
      name: m.name,
      paid,
      share,
      balance,
      status: balance > 0 ? 'receive' : balance < 0 ? 'pay' : 'settled',
    };
  });

  return {
    key,
    total,
    count,
    perHead: base,
    expenseCount: expenses.length,
    rows,
  };
}

/** One entry per month from the earliest expense (or this month) up to the current month, newest first. */
export function buildHistory(allExpenses, members, nowKey = currentMonthKey()) {
  const keys = allExpenses.map((e) => monthKeyOf(e.expense_date));
  const earliest = keys.length ? keys.reduce((a, b) => (a < b ? a : b)) : nowKey;
  const latest = keys.length ? keys.reduce((a, b) => (a > b ? a : b)) : nowKey;
  const end = latest > nowKey ? latest : nowKey;

  const byMonth = new Map();
  for (const e of allExpenses) {
    const k = monthKeyOf(e.expense_date);
    if (!byMonth.has(k)) byMonth.set(k, []);
    byMonth.get(k).push(e);
  }

  return monthRange(earliest < nowKey ? earliest : nowKey, end)
    .map((k) => calculateMonth(byMonth.get(k) || [], members, k))
    .reverse();
}
