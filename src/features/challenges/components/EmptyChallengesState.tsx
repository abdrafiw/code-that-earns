import { Code2 } from 'lucide-react';
import { Button } from '../../../components/ui/button';
import { CreateChallengeDialog } from './CreateChallengeDialog';

type EmptyChallengesStateProps = {
  hasActiveFilters: boolean;
  onClearFilters: () => void;
};

export function EmptyChallengesState({
  hasActiveFilters,
  onClearFilters,
}: EmptyChallengesStateProps) {
  return (
    <div className="space-y-4 rounded-lg border border-dashed border-gray-300 bg-white px-6 py-12 text-center sm:py-14">
      <Code2 className="mx-auto size-8 text-gray-300" />
      <h3 className="font-medium text-gray-950">
        {hasActiveFilters ? 'No matching challenges' : 'No challenges yet'}
      </h3>

      <p className="mx-auto max-w-sm text-sm text-gray-500">
        {hasActiveFilters
          ? 'Try changing your search or filters.'
          : 'Create a challenge to start receiving solutions from developers.'}
      </p>

      {hasActiveFilters ? (
        <Button variant="outline" onClick={onClearFilters}>
          Clear filters
        </Button>
      ) : (
        <CreateChallengeDialog />
      )}
    </div>
  );
}
