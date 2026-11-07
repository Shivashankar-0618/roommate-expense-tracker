import { Card } from './ui.jsx';

export default function StatCard({ icon: Icon, label, value, note, accent }) {
  return (
    <Card className="!p-5">
      <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-[0.12em] text-ink-soft">
        {Icon && <Icon size={14} className="text-forest" />}
        {label}
      </div>
      <p className={`mt-2 font-display text-3xl font-semibold tabular-nums ${accent || 'text-forest'}`}>{value}</p>
      {note && <p className="mt-1 text-xs text-ink-soft">{note}</p>}
    </Card>
  );
}
