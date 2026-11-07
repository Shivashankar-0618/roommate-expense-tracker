import {
  Bar, BarChart, CartesianGrid, Cell, Legend, Pie, PieChart, ResponsiveContainer, Tooltip, XAxis, YAxis,
} from 'recharts';
import { COLORS, MEMBER_COLORS, tooltipStyle } from '../lib/theme.js';
import { formatINR, formatINRShort } from '../lib/money.js';

const axisProps = { tick: { fill: COLORS.inkSoft, fontSize: 12 }, axisLine: false, tickLine: false };

export function EmptyChart({ children = 'No expenses this month yet.' }) {
  return (
    <div className="flex h-64 items-center justify-center rounded-xl border border-dashed border-sand-deep text-sm text-ink-soft">
      {children}
    </div>
  );
}

/** Who actually paid how much this month. */
export function ContributionPie({ rows, total }) {
  const data = rows.filter((r) => r.paid > 0);
  if (!total) return <EmptyChart />;
  return (
    <ResponsiveContainer width="100%" height={300}>
      <PieChart>
        <Pie data={data} dataKey="paid" nameKey="name" innerRadius={62} outerRadius={104} paddingAngle={2} stroke={COLORS.ivory} strokeWidth={2}>
          {data.map((r) => (
            <Cell key={r.id} fill={MEMBER_COLORS[rows.findIndex((x) => x.id === r.id) % MEMBER_COLORS.length]} />
          ))}
        </Pie>
        <Tooltip
          contentStyle={tooltipStyle}
          formatter={(v, name) => [`${formatINR(v)} (${((v / total) * 100).toFixed(1)}%)`, name]}
        />
        <Legend iconType="circle" wrapperStyle={{ fontSize: 13 }} />
      </PieChart>
    </ResponsiveContainer>
  );
}

/** Each member: what they paid vs what their equal share is. */
export function MemberComparison({ rows, total }) {
  if (!total) return <EmptyChart />;
  const data = rows.map((r) => ({ name: r.name, Paid: r.paid, 'Fair share': r.share }));
  return (
    <ResponsiveContainer width="100%" height={300}>
      <BarChart data={data} margin={{ top: 8, right: 8, left: -8, bottom: 0 }} barGap={4}>
        <CartesianGrid vertical={false} stroke={COLORS.sandDeep} strokeDasharray="3 3" />
        <XAxis dataKey="name" {...axisProps} />
        <YAxis tickFormatter={formatINRShort} {...axisProps} width={56} />
        <Tooltip contentStyle={tooltipStyle} cursor={{ fill: 'rgba(168,184,160,0.18)' }} formatter={(v) => formatINR(v)} />
        <Legend iconType="circle" wrapperStyle={{ fontSize: 13 }} />
        <Bar dataKey="Paid" fill={COLORS.forest} radius={[6, 6, 0, 0]} maxBarSize={36} />
        <Bar dataKey="Fair share" fill={COLORS.sage} radius={[6, 6, 0, 0]} maxBarSize={36} />
      </BarChart>
    </ResponsiveContainer>
  );
}

/** Total per month, last 12 months, selected month highlighted. */
export function MonthlyTotals({ data, selected }) {
  if (!data.some((d) => d.total > 0)) return <EmptyChart>No history yet.</EmptyChart>;
  return (
    <ResponsiveContainer width="100%" height={260}>
      <BarChart data={data} margin={{ top: 8, right: 8, left: -8, bottom: 0 }}>
        <CartesianGrid vertical={false} stroke={COLORS.sandDeep} strokeDasharray="3 3" />
        <XAxis dataKey="label" {...axisProps} interval="preserveStartEnd" />
        <YAxis tickFormatter={formatINRShort} {...axisProps} width={56} />
        <Tooltip contentStyle={tooltipStyle} cursor={{ fill: 'rgba(168,184,160,0.18)' }} formatter={(v) => [formatINR(v), 'Total']} />
        <Bar dataKey="total" radius={[6, 6, 0, 0]} maxBarSize={40}>
          {data.map((d) => (
            <Cell key={d.key} fill={d.key === selected ? COLORS.forest : COLORS.sage} />
          ))}
        </Bar>
      </BarChart>
    </ResponsiveContainer>
  );
}
