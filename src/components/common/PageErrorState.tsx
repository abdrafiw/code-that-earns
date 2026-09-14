import { RefreshCw, WifiOff } from 'lucide-react';
import { Button } from '../ui/button';

type PageErrorStateProps = {
  message: string;
  onRetry?: () => void;
  isRetrying?: boolean;
};

export const PageErrorState = ({
  message,
  onRetry,
  isRetrying = false,
}: PageErrorStateProps) => {
  return (
    <div
      role="alert"
      className="rounded-lg border border-red-200 bg-red-50 p-5"
    >
      <div className="flex items-start gap-3">
        <WifiOff aria-hidden="true" className="mt-0.5 size-5 text-red-600" />
        <div className="min-w-0 flex-1">
          <h3 className="font-medium text-red-900">Something went wrong</h3>
          <p className="mt-1 text-sm break-words text-red-700">{message}</p>
          {onRetry && (
            <Button
              type="button"
              variant="outline"
              size="sm"
              className="mt-4 border-red-200 bg-white text-red-700 hover:bg-red-100"
              onClick={onRetry}
              disabled={isRetrying}
            >
              <RefreshCw
                aria-hidden="true"
                className={isRetrying ? 'animate-spin' : ''}
              />
              {isRetrying ? 'Trying again…' : 'Try again'}
            </Button>
          )}
        </div>
      </div>
    </div>
  );
};
