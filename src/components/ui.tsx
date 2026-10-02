import React from 'react';
import { BandState } from '../types/spectrum';

export function cx(...classes: (string | false | null | undefined)[]): string {
  return classes.filter(Boolean).join(' ');
}

export const STATE_META: Record<
  BandState,
  { label: string; text: string; chip: string; dot: string; hex: string }
> = {
  HIGH: {
    label: 'High',
    text: 'text-high',
    chip: 'bg-high/15 text-high ring-high/30',
    dot: 'bg-high',
    hex: '#f25f5c',
  },
  UNCERTAIN: {
    label: 'Uncertain',
    text: 'text-uncertain',
    chip: 'bg-uncertain/15 text-uncertain ring-uncertain/30',
    dot: 'bg-uncertain',
    hex: '#f2b544',
  },
  LOW: {
    label: 'Low',
    text: 'text-low',
    chip: 'bg-low/15 text-low ring-low/30',
    dot: 'bg-low',
    hex: '#5b8def',
  },
  IDLE: {
    label: 'Idle',
    text: 'text-muted',
    chip: 'bg-idle/30 text-muted ring-line-strong',
    dot: 'bg-idle',
    hex: '#4a5466',
  },
};

/** Colors for the four priority factors, shared by the engine panel and method page. */
export const FACTOR_META = {
  activity: { label: 'Activity', hex: '#2dd4bf', swatch: 'bg-[#2dd4bf]' },
  recency: { label: 'Recency', hex: '#60a5fa', swatch: 'bg-[#60a5fa]' },
  uncertainty: { label: 'Uncertainty', hex: '#c084fc', swatch: 'bg-[#c084fc]' },
  history: { label: 'History', hex: '#d6b98c', swatch: 'bg-[#d6b98c]' },
} as const;

interface PanelProps {
  title?: React.ReactNode;
  subtitle?: React.ReactNode;
  actions?: React.ReactNode;
  className?: string;
  bodyClassName?: string;
  children: React.ReactNode;
}

export const Panel: React.FC<PanelProps> = ({
  title,
  subtitle,
  actions,
  className,
  bodyClassName,
  children,
}) => (
  <section className={cx('rounded-xl border border-line bg-surface', className)}>
    {(title || actions) && (
      <header className="flex flex-wrap items-start justify-between gap-3 border-b border-line px-4 py-3">
        <div className="min-w-0">
          {title && <h2 className="text-sm font-semibold text-fg">{title}</h2>}
          {subtitle && <p className="mt-0.5 text-xs text-muted">{subtitle}</p>}
        </div>
        {actions && <div className="flex shrink-0 items-center gap-2">{actions}</div>}
      </header>
    )}
    <div className={cx('p-4', bodyClassName)}>{children}</div>
  </section>
);

export const StateChip: React.FC<{ state: BandState }> = ({ state }) => {
  const meta = STATE_META[state];
  return (
    <span
      className={cx(
        'inline-flex items-center gap-1.5 whitespace-nowrap rounded-md px-1.5 py-0.5 text-[11px] font-medium ring-1 ring-inset',
        meta.chip
      )}
    >
      <span className={cx('size-1.5 rounded-full', meta.dot)} />
      {meta.label}
    </span>
  );
};

interface SegmentedOption<T extends string | number> {
  value: T;
  label: React.ReactNode;
  title?: string;
}

export function Segmented<T extends string | number>({
  value,
  options,
  onChange,
  ariaLabel,
}: {
  value: T;
  options: SegmentedOption<T>[];
  onChange: (value: T) => void;
  ariaLabel: string;
}) {
  return (
    <div
      role="radiogroup"
      aria-label={ariaLabel}
      className="inline-flex rounded-lg border border-line bg-bg p-0.5"
    >
      {options.map((option) => {
        const active = option.value === value;
        return (
          <button
            key={String(option.value)}
            type="button"
            role="radio"
            aria-checked={active}
            title={option.title}
            onClick={() => onChange(option.value)}
            className={cx(
              'rounded-md px-2.5 py-1 text-xs font-medium whitespace-nowrap transition-colors',
              active
                ? 'bg-raised text-fg ring-1 ring-line-strong'
                : 'text-muted hover:text-fg'
            )}
          >
            {option.label}
          </button>
        );
      })}
    </div>
  );
}

type ButtonVariant = 'primary' | 'secondary' | 'ghost';

export const Button: React.FC<
  React.ButtonHTMLAttributes<HTMLButtonElement> & { variant?: ButtonVariant }
> = ({ variant = 'secondary', className, type = 'button', ...rest }) => (
  <button
    type={type}
    {...rest}
    className={cx(
      'inline-flex items-center justify-center gap-1.5 rounded-lg px-3 py-1.5 text-xs font-medium whitespace-nowrap transition-colors disabled:pointer-events-none disabled:opacity-40',
      variant === 'primary' && 'bg-accent text-bg hover:bg-accent-strong',
      variant === 'secondary' &&
        'border border-line bg-raised text-fg hover:border-line-strong hover:bg-line',
      variant === 'ghost' && 'text-muted hover:bg-raised hover:text-fg',
      className
    )}
  />
);

export const Kbd: React.FC<{ children: React.ReactNode }> = ({ children }) => (
  <kbd className="rounded border border-line-strong bg-bg px-1 font-mono text-[10px] leading-4 text-muted">
    {children}
  </kbd>
);

export const Meter: React.FC<{ value: number; colorClass?: string; className?: string }> = ({
  value,
  colorClass = 'bg-accent',
  className,
}) => (
  <div className={cx('h-1.5 w-full overflow-hidden rounded-full bg-line', className)}>
    <div
      className={cx('h-full rounded-full transition-[width] duration-300', colorClass)}
      style={{ width: `${Math.max(0, Math.min(100, value))}%` }}
    />
  </div>
);

export const Label: React.FC<{ children: React.ReactNode; className?: string }> = ({
  children,
  className,
}) => (
  <div className={cx('text-[11px] font-medium uppercase tracking-wide text-faint', className)}>
    {children}
  </div>
);
