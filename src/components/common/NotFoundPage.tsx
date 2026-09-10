import { ArrowLeft, Home } from 'lucide-react';
import { Link, useNavigate } from 'react-router-dom';
import { Button } from '../ui/button';

export function NotFoundPage() {
  const navigate = useNavigate();

  return (
    <main className="flex min-h-[calc(100vh-4rem)] items-center justify-center px-4 py-16">
      <section className="max-w-lg text-center">
        <p className="text-sm font-semibold tracking-widest text-orange-600 uppercase">
          Error 404
        </p>
        <h1 className="mt-3 text-3xl font-semibold tracking-tight text-gray-950 sm:text-4xl">
          Page not found
        </h1>
        <p className="mt-4 text-sm leading-6 text-gray-600">
          The page may have moved, been removed, or never existed.
        </p>
        <div className="mt-8 flex flex-col justify-center gap-3 sm:flex-row">
          <Button type="button" variant="outline" onClick={() => navigate(-1)}>
            <ArrowLeft aria-hidden="true" className="size-4" />
            Go back
          </Button>
          <Button asChild>
            <Link to="/">
              <Home aria-hidden="true" className="size-4" />
              Return home
            </Link>
          </Button>
        </div>
      </section>
    </main>
  );
}
