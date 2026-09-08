import type { LucideIcon } from 'lucide-react';
import { cn } from '../../../lib/utils';

type KpiCardProps = {
  icon: LucideIcon;
  label: string;
  value: string | number;
  suffix?: string;
  iconClassName?: string;
};

export function KpiCard({
  icon: Icon,
  label,
  value,
  suffix,
  iconClassName,
}: KpiCardProps) {
  return (
    <article className="rounded-lg border border-gray-200 bg-white p-5">
      <div className="flex items-center gap-3 text-gray-500">
        <span className={cn('rounded-md p-2', iconClassName)}>
          <Icon aria-hidden="true" className="size-4" />
        </span>
        <span className="text-sm">{label}</span>
      </div>

      <p className="mt-4 text-2xl font-semibold text-gray-950">
        {value}
        {suffix && (
          <span className="ml-1 text-sm font-medium text-gray-500">
            {suffix}
          </span>
        )}
      </p>
    </article>
  );
}
