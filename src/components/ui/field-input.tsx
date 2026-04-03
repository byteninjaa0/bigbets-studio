'use client';

import { forwardRef, type InputHTMLAttributes } from 'react';
import type { LucideIcon } from 'lucide-react';
import { cn } from '@/lib/utils';

export type FieldInputProps = InputHTMLAttributes<HTMLInputElement> & {
  /** Renders a leading icon with correct padding so text never overlaps. */
  icon?: LucideIcon;
};

/**
 * Consistent form control: fixed min height, theme-aligned focus/placeholder, optional leading icon.
 */
export const FieldInput = forwardRef<HTMLInputElement, FieldInputProps>(function FieldInput(
  { className, icon: Icon, disabled, type = 'text', ...props },
  ref
) {
  const inputClass = cn(
    'input-dark w-full text-[0.9375rem] text-white placeholder:text-zinc-500',
    Icon && '!pl-11 pr-4 sm:!pr-5',
    className
  );

  if (!Icon) {
    return <input ref={ref} type={type} disabled={disabled} className={inputClass} {...props} />;
  }

  return (
    <div className="relative w-full">
      <Icon
        className="pointer-events-none absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-white/35"
        aria-hidden
      />
      <input ref={ref} type={type} disabled={disabled} className={inputClass} {...props} />
    </div>
  );
});
