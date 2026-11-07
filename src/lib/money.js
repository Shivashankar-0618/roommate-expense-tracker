// All money is stored and calculated as INTEGER PAISE (1 rupee = 100 paise).

/** "1,250.5" -> 125050. Returns null for invalid input (max 2 decimals, > 0 not enforced here). */
export function rupeesToPaise(input) {
  const s = String(input ?? '').trim().replace(/,/g, '');
  if (!/^\d+(\.\d{1,2})?$/.test(s)) return null;
  const [rupees, paise = ''] = s.split('.');
  return parseInt(rupees, 10) * 100 + parseInt(paise.padEnd(2, '0'), 10);
}

/** 125050 -> "1250.50" (for editing in an input box) */
export function paiseToInput(paise) {
  const sign = paise < 0 ? '-' : '';
  const abs = Math.abs(paise);
  const r = Math.floor(abs / 100);
  const p = abs % 100;
  return p ? `${sign}${r}.${String(p).padStart(2, '0')}` : `${sign}${r}`;
}

const inr = new Intl.NumberFormat('en-IN');

/** 12505000 -> "₹1,25,050.00" (Indian digit grouping) */
export function formatINR(paise) {
  const sign = paise < 0 ? '-' : '';
  const abs = Math.abs(paise);
  const rupees = inr.format(Math.floor(abs / 100));
  const p = String(abs % 100).padStart(2, '0');
  return `${sign}₹${rupees}.${p}`;
}

/** Compact for chart axes: 150000 -> "₹1.5k" */
export function formatINRShort(paise) {
  const r = paise / 100;
  if (Math.abs(r) >= 100000) return `₹${+(r / 100000).toFixed(1)}L`;
  if (Math.abs(r) >= 1000) return `₹${+(r / 1000).toFixed(1)}k`;
  return `₹${Math.round(r)}`;
}
