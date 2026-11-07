import { Banknote, Scale, Users } from 'lucide-react';
import { Button, Card, SectionTitle } from '../components/ui.jsx';
import MonthPicker from '../components/MonthPicker.jsx';
import StatCard from '../components/StatCard.jsx';
import BalanceBadge from '../components/BalanceBadge.jsx';
import { ContributionPie, MemberComparison, MonthlyTotals } from '../components/charts.jsx';
import { formatINR } from '../lib/money.js';
import { formatMonth, formatMonthShort } from '../lib/dates.js';

export default function AnalysisPage({ month, onMonth, summary, history, onOpenMonth }) {
  const { total, perHead, count, rows } = summary;
  const chartHistory = history
    .slice(0, 12)
    .reverse()
    .map((h) => ({ key: h.key, label: formatMonthShort(h.key), total: h.total }));

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.14em] text-ink-soft">Analysis for</p>
          <h1 className="font-display text-3xl font-semibold text-forest sm:text-4xl">{formatMonth(month)}</h1>
        </div>
        <MonthPicker value={month} onChange={onMonth} />
      </div>

      <div className="grid gap-4 sm:grid-cols-3">
        <StatCard icon={Banknote} label="Total expenses" value={formatINR(total)} note={`${summary.expenseCount} ${summary.expenseCount === 1 ? 'entry' : 'entries'}`} />
        <StatCard icon={Scale} label="Per head" value={formatINR(perHead)} note={`${formatINR(total)} ÷ ${count}`} />
        <StatCard icon={Users} label="Roommates" value={String(count)} note="Splitting equally" />
      </div>

      <Card>
        <SectionTitle eyebrow="Who owes what">Contribution &amp; balances</SectionTitle>
        <div className="relative overflow-x-auto rounded-xl border border-sand-deep/70 bg-ivory">
          <table className="w-full text-left text-sm">
            <thead className="bg-sand-pale text-xs uppercase tracking-wider text-ink-soft">
              <tr>
                <th className="px-3 py-3 font-semibold sm:px-4">Roommate</th>
                <th className="hidden px-4 py-3 text-right font-semibold sm:table-cell">Paid</th>
                <th className="hidden px-4 py-3 text-right font-semibold sm:table-cell">Fair share</th>
                <th className="px-3 py-3 text-right font-semibold sm:px-4">Balance</th>
              </tr>
            </thead>
            <tbody>
              {rows.map((r) => (
                <tr key={r.id} className="border-t border-sand-deep/40 even:bg-sand-pale/60">
                  <td className="px-3 py-3.5 sm:px-4">
                    <span className="font-medium text-ink">{r.name}</span>
                    <span className="block text-xs tabular-nums text-ink-soft sm:hidden">Paid {formatINR(r.paid)}</span>
                  </td>
                  <td className="hidden px-4 py-3.5 text-right tabular-nums sm:table-cell">{formatINR(r.paid)}</td>
                  <td className="hidden px-4 py-3.5 text-right tabular-nums text-ink-soft sm:table-cell">{formatINR(r.share)}</td>
                  <td className="px-3 py-3 text-right sm:px-4"><BalanceBadge balance={r.balance} /></td>
                </tr>
              ))}
            </tbody>
            <tfoot>
              <tr className="border-t border-sand-deep bg-sand-pale font-semibold text-forest">
                <td className="px-3 py-3 sm:px-4">
                  Total
                  <span className="block text-xs tabular-nums sm:hidden">{formatINR(total)}</span>
                </td>
                <td className="hidden px-4 py-3 text-right tabular-nums sm:table-cell">{formatINR(total)}</td>
                <td className="hidden px-4 py-3 text-right tabular-nums sm:table-cell">{formatINR(total)}</td>
                <td className="px-3 py-3 text-right text-xs font-medium text-ink-soft sm:px-4">Nets to ₹0.00</td>
              </tr>
            </tfoot>
          </table>
        </div>
      </Card>

      <div className="grid gap-6 lg:grid-cols-2">
        <Card>
          <SectionTitle eyebrow="Share of spending">Who paid</SectionTitle>
          <ContributionPie rows={rows} total={total} />
        </Card>
        <Card>
          <SectionTitle eyebrow="Member-wise comparison">Paid vs fair share</SectionTitle>
          <MemberComparison rows={rows} total={total} />
        </Card>
      </div>

      <Card>
        <SectionTitle eyebrow="Last 12 months">Monthly history</SectionTitle>
        <MonthlyTotals data={chartHistory} selected={month} />
        <div className="relative mt-5 overflow-x-auto rounded-xl border border-sand-deep/70 bg-ivory">
          <table className="w-full min-w-[30rem] text-left text-sm">
            <thead className="bg-sand-pale text-xs uppercase tracking-wider text-ink-soft">
              <tr>
                <th className="px-4 py-3 font-semibold">Month</th>
                <th className="px-4 py-3 text-right font-semibold">Entries</th>
                <th className="px-4 py-3 text-right font-semibold">Total</th>
                <th className="px-4 py-3 text-right font-semibold">Per head</th>
                <th className="px-4 py-3"><span className="sr-only">Open</span></th>
              </tr>
            </thead>
            <tbody>
              {history.map((h) => (
                <tr
                  key={h.key}
                  className={`border-t border-sand-deep/40 even:bg-sand-pale/60 ${h.key === month ? '!bg-sage-pale/70' : ''}`}
                >
                  <td className="px-4 py-3 font-medium text-ink">{formatMonth(h.key)}</td>
                  <td className="px-4 py-3 text-right tabular-nums text-ink-soft">{h.expenseCount}</td>
                  <td className="px-4 py-3 text-right font-semibold tabular-nums text-forest">{formatINR(h.total)}</td>
                  <td className="px-4 py-3 text-right tabular-nums">{formatINR(h.perHead)}</td>
                  <td className="px-3 py-2 text-right">
                    <Button variant="ghost" className="!px-3 !py-1.5" onClick={() => onOpenMonth(h.key)}>View</Button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Card>
    </div>
  );
}
