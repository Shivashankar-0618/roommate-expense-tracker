import { ArrowDownLeft, ArrowUpRight, Check } from 'lucide-react';
import { formatINR } from '../lib/money.js';
import { cx } from './ui.jsx';

/** Sage = receives money, terracotta = needs to pay, sand = settled. */
export default function BalanceBadge({ balance, className }) {
  const base = 'inline-flex items-center gap-1.5 rounded-full px-3 py-1 text-xs font-semibold tabular-nums whitespace-nowrap';
  if (balance > 0) {
    return (
      <span className={cx(base, 'bg-sage-pale text-sage-deep', className)}>
        <ArrowDownLeft size={13} /> Receives {formatINR(balance)}
      </span>
    );
  }
  if (balance < 0) {
    return (
      <span className={cx(base, 'bg-terra-pale text-terra-deep', className)}>
        <ArrowUpRight size={13} /> Pays {formatINR(-balance)}
      </span>
    );
  }
  return (
    <span className={cx(base, 'bg-sand text-ink-soft', className)}>
      <Check size={13} /> Settled
    </span>
  );
}
