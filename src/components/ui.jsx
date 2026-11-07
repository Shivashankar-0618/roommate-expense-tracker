import { useEffect } from 'react';
import { X, Loader2, AlertCircle } from 'lucide-react';

export const cx = (...c) => c.filter(Boolean).join(' ');

const BTN = {
  primary: 'bg-forest text-ivory hover:bg-forest-light focus-visible:ring-forest',
  secondary: 'bg-sand text-forest hover:bg-sand-deep focus-visible:ring-forest',
  ghost: 'text-forest hover:bg-sand/70 focus-visible:ring-forest',
  danger: 'bg-terra text-white hover:bg-terra-deep focus-visible:ring-terra',
};

export function Button({ variant = 'primary', icon: Icon, loading, children, className, ...rest }) {
  return (
    <button
      {...rest}
      disabled={rest.disabled || loading}
      className={cx(
        'inline-flex items-center justify-center gap-2 rounded-full px-4 py-2.5 text-sm font-medium',
        'transition-colors duration-200 focus:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-offset-ivory',
        'disabled:cursor-not-allowed disabled:opacity-50',
        BTN[variant],
        className
      )}
    >
      {loading ? <Loader2 size={16} className="animate-spin" /> : Icon ? <Icon size={16} /> : null}
      {children}
    </button>
  );
}

export function IconButton({ icon: Icon, label, tone = 'ghost', ...rest }) {
  return (
    <button
      {...rest}
      aria-label={label}
      title={label}
      className={cx(
        'inline-flex h-9 w-9 items-center justify-center rounded-full transition-colors duration-200',
        'focus:outline-none focus-visible:ring-2 focus-visible:ring-forest',
        tone === 'danger' ? 'text-terra-deep hover:bg-terra-pale' : 'text-forest hover:bg-sand'
      )}
    >
      <Icon size={17} />
    </button>
  );
}

export const inputCls =
  'w-full rounded-xl border border-sand-deep bg-white px-3.5 py-2.5 text-sm text-ink placeholder:text-ink-soft/60 ' +
  'transition-shadow duration-200 focus:border-forest focus:outline-none focus:ring-2 focus:ring-sage';

export function Field({ label, hint, children }) {
  return (
    <label className="block">
      <span className="mb-1.5 block text-xs font-semibold uppercase tracking-wider text-ink-soft">{label}</span>
      {children}
      {hint && <span className="mt-1 block text-xs text-ink-soft">{hint}</span>}
    </label>
  );
}

export function Card({ className, children, ...rest }) {
  return (
    <section {...rest} className={cx('rounded-2xl border border-sand-deep/70 bg-sand p-5 shadow-soft sm:p-6', className)}>
      {children}
    </section>
  );
}

export function SectionTitle({ eyebrow, children, aside }) {
  return (
    <div className="mb-4 flex items-end justify-between gap-3">
      <div>
        {eyebrow && <p className="text-xs font-semibold uppercase tracking-[0.14em] text-ink-soft">{eyebrow}</p>}
        <h2 className="font-display text-xl font-semibold text-forest sm:text-2xl">{children}</h2>
      </div>
      {aside}
    </div>
  );
}

export function ErrorNote({ children }) {
  if (!children) return null;
  return (
    <div role="alert" className="flex items-start gap-2 rounded-xl border border-terra/40 bg-terra-pale px-3.5 py-2.5 text-sm text-terra-deep">
      <AlertCircle size={16} className="mt-0.5 shrink-0" />
      <span>{children}</span>
    </div>
  );
}

export function Spinner({ label = 'Loading…' }) {
  return (
    <div className="flex items-center justify-center gap-2 py-16 text-sm text-ink-soft">
      <Loader2 size={18} className="animate-spin" /> {label}
    </div>
  );
}

export function Modal({ title, onClose, children }) {
  useEffect(() => {
    const onKey = (e) => e.key === 'Escape' && onClose();
    document.addEventListener('keydown', onKey);
    const prev = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    return () => {
      document.removeEventListener('keydown', onKey);
      document.body.style.overflow = prev;
    };
  }, [onClose]);

  return (
    <div className="fixed inset-0 z-50 flex items-end justify-center sm:items-center sm:p-4" role="dialog" aria-modal="true" aria-label={title}>
      <div className="absolute inset-0 animate-fade bg-forest-dark/55" onClick={onClose} />
      <div className="relative max-h-[92vh] w-full animate-rise overflow-y-auto rounded-t-3xl border border-sand-deep bg-ivory p-5 shadow-soft sm:max-w-md sm:rounded-3xl sm:p-7">
        <div className="mb-5 flex items-center justify-between">
          <h3 className="font-display text-xl font-semibold text-forest">{title}</h3>
          <IconButton icon={X} label="Close" onClick={onClose} />
        </div>
        {children}
      </div>
    </div>
  );
}
