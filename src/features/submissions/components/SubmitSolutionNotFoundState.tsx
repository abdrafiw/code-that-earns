import { SearchX } from 'lucide-react';
import { Link } from 'react-router-dom';
import { Button } from '../../../components/ui/button';

export const SubmitSolutionNotFoundState = () => {
  return (
    <section
      aria-labelledby="bounty-not-found-title"
      className="flex min-h-[calc(100dvh-4rem)] items-center justify-center px-4 py-16 text-center"
    >
      <div className="w-full max-w-md rounded-xl border border-gray-200 bg-white p-8 shadow-sm">
        <span className="mx-auto flex size-12 items-center justify-center rounded-full bg-gray-100 text-gray-600">
          <SearchX aria-hidden="true" className="size-6" />
        </span>
        <h1
          id="bounty-not-found-title"
          className="mt-5 text-2xl font-semibold text-gray-950"
        >
          Bounty not found
        </h1>
        <p className="mt-2 text-sm leading-6 text-gray-600">
          This bounty may have been removed or the link may be incorrect.
        </p>
        <div className="mt-7 flex flex-col justify-center gap-3 sm:flex-row">
          <Button variant="outline" asChild>
            <Link to="/">Return home</Link>
          </Button>
          <Button asChild>
            <Link to="/dev-bounties">Browse bounties</Link>
          </Button>
        </div>
      </div>
    </section>
  );
};
