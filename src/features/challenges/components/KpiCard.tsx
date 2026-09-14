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
    <article className="space-y-3 rounded-lg border border-gray-200 bg-white p-4 sm:space-y-4 sm:p-5">
      <div className="flex items-center gap-3 text-gray-500">
        <span className={cn('rounded-md p-2', iconClassName)}>
          <Icon aria-hidden="true" className="size-4" />
        </span>
        <span className="text-sm">{label}</span>
      </div>

      <p className="text-xl font-semibold wrap-break-word text-gray-950 sm:text-2xl">
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
