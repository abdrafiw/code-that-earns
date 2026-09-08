import { Skeleton } from '../ui/skeleton';
import { twMerge } from 'tailwind-merge';

type LoadingStateProps = {
  message?: string;
  className?: string;
  fullscreen?: boolean;
};

export const LoadingState = ({
  message = 'Loading...',
  className,
  fullscreen = true,
}: LoadingStateProps) => {
  return (
    <div
      role="status"
      className={twMerge(
        'flex items-center justify-center',
        fullscreen ? 'min-h-screen' : 'min-h-40',
        className,
      )}
    >
      <div className="flex flex-col items-center gap-4">
        <Skeleton className="h-6 w-48" />
        <Skeleton className="h-4 w-64" />
        <p className="sr-only">{message}</p>
      </div>
    </div>
  );
};
