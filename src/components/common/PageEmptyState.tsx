import { Inbox } from 'lucide-react';
import { Link } from 'react-router-dom';
import { Button } from '../ui/button';

type PageEmptyStateProps = {
  title: string;
  description: string;
  actionHref?: string;
  actionLabel?: string;
};

export const PageEmptyState = ({
  title,
  description,
  actionHref,
  actionLabel,
}: PageEmptyStateProps) => {
  return (
    <section
      aria-labelledby="empty-state-title"
      className="rounded-xl border border-dashed border-gray-300 bg-white px-6 py-12 text-center"
    >
      <Inbox aria-hidden="true" className="mx-auto size-8 text-gray-400" />
      <h2 id="empty-state-title" className="mt-4 font-semibold text-gray-950">
        {title}
      </h2>
      <p className="mx-auto mt-2 max-w-md text-sm leading-6 text-gray-500">
        {description}
      </p>
      {actionHref && actionLabel && (
        <Button className="mt-6" asChild>
          <Link to={actionHref}>{actionLabel}</Link>
        </Button>
      )}
    </section>
  );
};
