import { useState } from 'react';
import { IndianRupee } from 'lucide-react';
import { Button, ErrorNote, Field, Modal, inputCls, cx } from './ui.jsx';
import { paiseToInput, rupeesToPaise } from '../lib/money.js';
import { firstDayOfMonth, formatMonth, lastDayOfMonth, monthKeyOf, todayISO, currentMonthKey } from '../lib/dates.js';
import { isActiveInMonth } from '../lib/calc.js';

/** Add / edit modal. The date is limited to the selected month so every expense lands in the month you're viewing. */
export default function ExpenseForm({ members, month, initial, onSubmit, onClose }) {
  const editing = Boolean(initial);
  const payers = members.filter((m) => isActiveInMonth(m, month) || m.id === initial?.paid_by);

  const [description, setDescription] = useState(initial?.description ?? '');
  const [amount, setAmount] = useState(initial ? paiseToInput(initial.amount_paise) : '');
  const [paidBy, setPaidBy] = useState(initial?.paid_by ?? '');
  const [date, setDate] = useState(
    initial?.expense_date ?? (month === currentMonthKey() ? todayISO() : firstDayOfMonth(month))
  );
  const [error, setError] = useState('');
  const [saving, setSaving] = useState(false);

  const submit = async (e) => {
    e.preventDefault();
    const desc = description.trim();
    const paise = rupeesToPaise(amount);
    if (!desc) return setError('Please enter what the expense was for.');
    if (paise === null || paise <= 0) return setError('Enter a valid amount in rupees (up to 2 decimals).');
    if (!paidBy) return setError('Select who paid.');
    if (!date || monthKeyOf(date) !== month) return setError(`Date must be within ${formatMonth(month)}.`);

    setSaving(true);
    setError('');
    try {
      await onSubmit({ description: desc, amount_paise: paise, paid_by: paidBy, expense_date: date });
      onClose();
    } catch (err) {
      setError(err.message);
      setSaving(false);
    }
  };

  return (
    <Modal title={editing ? 'Edit expense' : 'Add expense'} onClose={onClose}>
      <form onSubmit={submit} className="space-y-5" noValidate>
        <Field label="Particular">
          <input
            autoFocus
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            maxLength={120}
            placeholder="e.g. Groceries, Wi-Fi bill, Cooking gas"
            className={inputCls}
          />
        </Field>

        <Field label="Amount">
          <div className="relative">
            <IndianRupee size={15} className="pointer-events-none absolute left-3.5 top-1/2 -translate-y-1/2 text-ink-soft" />
            <input
              inputMode="decimal"
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              placeholder="0.00"
              className={`${inputCls} pl-9 tabular-nums`}
            />
          </div>
        </Field>

        <fieldset>
          <legend className="mb-1.5 block text-xs font-semibold uppercase tracking-wider text-ink-soft">Paid by</legend>
          <div className="grid grid-cols-2 gap-2">
            {payers.map((m) => (
              <label
                key={m.id}
                className={cx(
                  'flex cursor-pointer items-center justify-center rounded-xl border px-3 py-2.5 text-sm font-medium transition-colors duration-200',
                  'focus-within:ring-2 focus-within:ring-sage',
                  paidBy === m.id
                    ? 'border-forest bg-forest text-ivory'
                    : 'border-sand-deep bg-white text-ink hover:bg-sand-pale'
                )}
              >
                <input
                  type="radio"
                  name="paid_by"
                  value={m.id}
                  checked={paidBy === m.id}
                  onChange={() => setPaidBy(m.id)}
                  className="sr-only"
                />
                {m.name}
              </label>
            ))}
          </div>
        </fieldset>

        <Field label="Date" hint={`Limited to ${formatMonth(month)}`}>
          <input
            type="date"
            value={date}
            min={firstDayOfMonth(month)}
            max={lastDayOfMonth(month)}
            onChange={(e) => setDate(e.target.value)}
            className={inputCls}
          />
        </Field>

        <ErrorNote>{error}</ErrorNote>

        <div className="flex justify-end gap-2 pt-1">
          <Button type="button" variant="ghost" onClick={onClose}>Cancel</Button>
          <Button type="submit" loading={saving}>{editing ? 'Save changes' : 'Add expense'}</Button>
        </div>
      </form>
    </Modal>
  );
}
