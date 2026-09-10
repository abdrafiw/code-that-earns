import { isRouteErrorResponse, Link, useRouteError } from 'react-router-dom';
import { AlertTriangle } from 'lucide-react';
import { Button } from '../ui/button';

export function RouteErrorPage() {
  const error = useRouteError();
  const message = isRouteErrorResponse(error)
    ? error.statusText || 'The requested page could not be loaded.'
    : error instanceof Error
      ? error.message
      : 'An unexpected error occurred while loading this page.';

  return (
    <main className="flex min-h-screen items-center justify-center bg-gray-50 px-4 py-16">
      <section className="w-full max-w-lg rounded-xl border border-gray-200 bg-white p-8 text-center shadow-sm">
        <span className="mx-auto flex size-12 items-center justify-center rounded-full bg-red-50 text-red-600">
          <AlertTriangle aria-hidden="true" className="size-6" />
        </span>
        <p className="mt-5 text-sm font-medium text-red-600">Page error</p>
        <h1 className="mt-2 text-2xl font-semibold text-gray-950">
          Something went wrong
        </h1>
        <p className="mt-3 text-sm leading-6 text-gray-600">{message}</p>
        <div className="mt-7 flex flex-col justify-center gap-3 sm:flex-row">
          <Button
            type="button"
            variant="outline"
            onClick={() => window.location.reload()}
          >
            Try again
          </Button>
          <Button asChild>
            <Link to="/">Return home</Link>
          </Button>
        </div>
      </section>
    </main>
  );
}
