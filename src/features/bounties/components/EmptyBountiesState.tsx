import { Code2 } from 'lucide-react';
import { Button } from '../../../components/ui/button';
import { CreateBountyDialog } from './CreateBountyDialog';

type EmptyBountiesStateProps = {
  hasActiveFilters: boolean;
  onClearFilters: () => void;
};

export function EmptyBountiesState({
  hasActiveFilters,
  onClearFilters,
}: EmptyBountiesStateProps) {
  return (
    <div className="rounded-lg border border-dashed border-gray-300 bg-white px-6 py-14 text-center">
      <Code2 className="mx-auto size-8 text-gray-300" />
      <h3 className="font-medium text-gray-950">
        {hasActiveFilters ? 'No matching bounties' : 'No bounties yet'}
      </h3>

      <p className="mx-auto max-w-sm text-sm text-gray-500">
        {hasActiveFilters
          ? 'Try changing your search or filters.'
          : 'Create a bounty to start receiving solutions from developers.'}
      </p>

      {hasActiveFilters ? (
        <Button variant="outline" className="mt-5" onClick={onClearFilters}>
          Clear filters
        </Button>
      ) : (
        <CreateBountyDialog />
      )}
    </div>
  );
}
