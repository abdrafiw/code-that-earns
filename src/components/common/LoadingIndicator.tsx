import { Skeleton } from '../ui/skeleton';
import { twMerge } from 'tailwind-merge';

const loaderSize = {
  sm: 'text-base',
  lg: 'text-2xl',
  xl: 'text-4xl',
} as const;

const loaderPosition = {
  start: 'justify-start',
  center: 'justify-center',
} as const;

export default function LoadingIndicator({
  className,
  loadingText = 'Loading...',
  position = 'center',
  size = 'sm',
}: {
  className?: string;
  loadingText?: string;
  position?: keyof typeof loaderPosition;
  size?: keyof typeof loaderSize;
}) {
  return (
    <div
      role="status"
      className={twMerge(
        'flex items-center',
        loaderSize[size],
        loaderPosition[position],
        className,
      )}
    >
      <Skeleton className="h-4 w-24" />
      <p className={'sr-only'}>{loadingText}</p>
    </div>
  );
}
