import { useState } from 'react';
import { Plus, ReceiptText } from 'lucide-react';
import { Button, Card, ErrorNote, Modal } from '../components/ui.jsx';
import MonthPicker from '../components/MonthPicker.jsx';
import ExpenseTable from '../components/ExpenseTable.jsx';
import ExpenseForm from '../components/ExpenseForm.jsx';
import { formatINR } from '../lib/money.js';
import { formatMonth } from '../lib/dates.js';

function ConfirmDelete({ expense, onConfirm, onClose }) {
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');
  const go = async () => {
    setBusy(true);
    try {
      await onConfirm(expense.id);
      onClose();
    } catch (e) {
      setError(e.message);
      setBusy(false);
    }
  };
  return (
    <Modal title="Delete expense?" onClose={onClose}>
      <p className="text-sm text-ink-soft">
        <strong className="text-ink">{expense.description}</strong> ({formatINR(expense.amount_paise)}) will be removed and this month's
        totals will be recalculated.
      </p>
      <div className="mt-4"><ErrorNote>{error}</ErrorNote></div>
      <div className="mt-6 flex justify-end gap-2">
        <Button variant="ghost" onClick={onClose}>Keep it</Button>
        <Button variant="danger" loading={busy} onClick={go}>Delete</Button>
      </div>
    </Modal>
  );
}

export default function ExpensesPage({ month, onMonth, summary, expenses, members, actions }) {
  const [form, setForm] = useState(null); // null | 'new' | expense
  const [toDelete, setToDelete] = useState(null);
  const nameById = new Map(members.map((m) => [m.id, m.name]));
  const nameOf = (id) => nameById.get(id) || 'Unknown';

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.14em] text-ink-soft">Expenses for</p>
          <h1 className="font-display text-3xl font-semibold text-forest sm:text-4xl">{formatMonth(month)}</h1>
        </div>
        <Button icon={Plus} onClick={() => setForm('new')}>Add expense</Button>
      </div>

      <div className="flex flex-wrap items-center justify-between gap-4">
        <MonthPicker value={month} onChange={onMonth} />
        <p className="text-sm text-ink-soft">
          {summary.expenseCount} {summary.expenseCount === 1 ? 'entry' : 'entries'} ·{' '}
          <span className="font-semibold tabular-nums text-forest">{formatINR(summary.total)}</span> total ·{' '}
          <span className="font-semibold tabular-nums text-forest">{formatINR(summary.perHead)}</span> each
        </p>
      </div>

      {expenses.length === 0 ? (
        <Card className="flex flex-col items-center gap-3 py-14 text-center">
          <span className="flex h-12 w-12 items-center justify-center rounded-full bg-ivory text-forest">
            <ReceiptText size={22} />
          </span>
          <p className="font-display text-xl font-semibold text-forest">Nothing recorded for {formatMonth(month)}</p>
          <p className="max-w-sm text-sm text-ink-soft">
            Every month starts fresh at ₹0.00. Add the first shared expense to begin.
          </p>
          <Button icon={Plus} onClick={() => setForm('new')} className="mt-1">Add expense</Button>
        </Card>
      ) : (
        <ExpenseTable expenses={expenses} nameOf={nameOf} onEdit={setForm} onDelete={setToDelete} />
      )}

      {form && (
        <ExpenseForm
          key={form === 'new' ? 'new' : form.id}
          members={members}
          month={month}
          initial={form === 'new' ? null : form}
          onSubmit={(values) => (form === 'new' ? actions.add(values) : actions.edit(form.id, values))}
          onClose={() => setForm(null)}
        />
      )}
      {toDelete && <ConfirmDelete expense={toDelete} onConfirm={actions.remove} onClose={() => setToDelete(null)} />}
    </div>
  );
}
