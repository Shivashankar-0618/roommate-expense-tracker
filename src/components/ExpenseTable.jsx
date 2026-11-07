import { Pencil, Trash2 } from 'lucide-react';
import { IconButton } from './ui.jsx';
import { formatINR } from '../lib/money.js';
import { formatDate } from '../lib/dates.js';

export default function ExpenseTable({ expenses, nameOf, onEdit, onDelete }) {
  return (
    <>
      {/* Desktop / tablet: table with subtle alternating rows */}
      <div className="relative hidden overflow-hidden rounded-2xl border border-sand-deep/80 bg-ivory shadow-soft md:block">
        <table className="w-full text-left text-sm">
          <thead className="bg-sand text-xs uppercase tracking-wider text-ink-soft">
            <tr>
              <th className="px-5 py-3 font-semibold">Date</th>
              <th className="px-5 py-3 font-semibold">Particular</th>
              <th className="px-5 py-3 font-semibold">Paid by</th>
              <th className="px-5 py-3 text-right font-semibold">Amount</th>
              <th className="w-28 px-5 py-3"><span className="sr-only">Actions</span></th>
            </tr>
          </thead>
          <tbody>
            {expenses.map((e) => (
              <tr key={e.id} className="border-t border-sand-deep/50 transition-colors even:bg-sand-pale/70 hover:bg-sage-pale/50">
                <td className="whitespace-nowrap px-5 py-3.5 text-ink-soft">{formatDate(e.expense_date)}</td>
                <td className="px-5 py-3.5 font-medium text-ink">{e.description}</td>
                <td className="px-5 py-3.5">
                  <span className="rounded-full bg-sand px-2.5 py-1 text-xs font-medium text-forest">{nameOf(e.paid_by)}</span>
                </td>
                <td className="whitespace-nowrap px-5 py-3.5 text-right font-semibold tabular-nums text-forest">
                  {formatINR(e.amount_paise)}
                </td>
                <td className="px-3 py-2">
                  <div className="flex justify-end">
                    <IconButton icon={Pencil} label={`Edit ${e.description}`} onClick={() => onEdit(e)} />
                    <IconButton icon={Trash2} label={`Delete ${e.description}`} tone="danger" onClick={() => onDelete(e)} />
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Mobile: stacked rows */}
      <ul className="space-y-2.5 md:hidden">
        {expenses.map((e) => (
          <li key={e.id} className="rounded-2xl border border-sand-deep/80 bg-ivory p-4 shadow-soft">
            <div className="flex items-start justify-between gap-3">
              <div className="min-w-0">
                <p className="truncate font-medium text-ink">{e.description}</p>
                <p className="mt-0.5 text-xs text-ink-soft">
                  {formatDate(e.expense_date)} · <span className="font-medium text-forest">{nameOf(e.paid_by)}</span>
                </p>
              </div>
              <p className="whitespace-nowrap font-semibold tabular-nums text-forest">{formatINR(e.amount_paise)}</p>
            </div>
            <div className="mt-2 flex justify-end">
              <IconButton icon={Pencil} label={`Edit ${e.description}`} onClick={() => onEdit(e)} />
              <IconButton icon={Trash2} label={`Delete ${e.description}`} tone="danger" onClick={() => onDelete(e)} />
            </div>
          </li>
        ))}
      </ul>
    </>
  );
}
