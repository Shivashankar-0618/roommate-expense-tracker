import { ChevronLeft, ChevronRight, CalendarDays } from 'lucide-react';
import { addMonths, currentMonthKey, formatMonth, makeMonthKey, monthNames, parseMonthKey } from '../lib/dates.js';
import { inputCls, IconButton } from './ui.jsx';

/** Month + year selector. Past months are freely browsable; future months are not. */
export default function MonthPicker({ value, onChange }) {
  const now = currentMonthKey();
  const { year: curYear, month: curMonth } = parseMonthKey(now);
  const { year, month } = parseMonthKey(value);

  const years = Array.from({ length: 6 }, (_, i) => curYear - 5 + i);
  const maxMonth = year === curYear ? curMonth : 12;

  const setYear = (y) => {
    const m = Math.min(month, y === curYear ? curMonth : 12);
    onChange(makeMonthKey(y, m));
  };

  return (
    <div className="flex flex-wrap items-center gap-2" role="group" aria-label={`Selected month: ${formatMonth(value)}`}>
      <IconButton icon={ChevronLeft} label="Previous month" onClick={() => onChange(addMonths(value, -1))} />
      <select
        aria-label="Month"
        value={month}
        onChange={(e) => onChange(makeMonthKey(year, Number(e.target.value)))}
        className={`${inputCls} !w-auto !py-2 pr-8`}
      >
        {monthNames.slice(0, maxMonth).map((n, i) => (
          <option key={n} value={i + 1}>{n}</option>
        ))}
      </select>
      <select
        aria-label="Year"
        value={year}
        onChange={(e) => setYear(Number(e.target.value))}
        className={`${inputCls} !w-auto !py-2 pr-8`}
      >
        {years.map((y) => (
          <option key={y} value={y}>{y}</option>
        ))}
      </select>
      <IconButton
        icon={ChevronRight}
        label="Next month"
        onClick={() => onChange(addMonths(value, 1))}
        disabled={value >= now}
        className="disabled:opacity-30"
      />
      {value !== now && (
        <button
          onClick={() => onChange(now)}
          className="inline-flex items-center gap-1.5 rounded-full bg-sage-pale px-3 py-1.5 text-xs font-semibold text-sage-deep transition-colors hover:bg-sage/50 focus:outline-none focus-visible:ring-2 focus-visible:ring-forest"
        >
          <CalendarDays size={14} /> Current month
        </button>
      )}
    </div>
  );
}
