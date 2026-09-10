import { useParams } from 'react-router-dom';
import { SubmitSolutionForm } from '../components/SubmitSolutionForm';
import { SubmitSolutionLoadingState } from '../components/SubmitSolutionLoadingState';
import { SubmitSolutionNotFoundState } from '../components/SubmitSolutionNotFoundState';
import { useGetBountyByID } from '../hooks/useBounty';
import { PageErrorState } from '../../../components/common/PageErrorState';
import { getErrorMessage } from '../../../utils/getErrorMessage';
import { BountyNotFoundError } from '../../../services/bounties/bountyService';

export const SubmitSolutionPage = () => {
  const { bountyId } = useParams();
  const bountyQuery = useGetBountyByID();
  const bounty = bountyQuery.data;

  if (!bountyId || bountyQuery.error instanceof BountyNotFoundError)
    return <SubmitSolutionNotFoundState />;

  if (bountyQuery.isPending) return <SubmitSolutionLoadingState />;

  if (bountyQuery.error)
    return (
      <PageErrorState
        message={getErrorMessage(bountyQuery.error)}
        onRetry={() => void bountyQuery.refetch()}
        isRetrying={bountyQuery.isFetching}
      />
    );

  if (!bounty) return <SubmitSolutionNotFoundState />;

  return (
    <main className="bg-background min-h-screen">
      <div className="mx-auto max-w-3xl px-4 py-8 sm:px-6 lg:px-8">
        <header className="">
          <h1 className="text-heading text-3xl font-bold">
            Submit Your Solution
          </h1>
          <p className="text-body">
            Submit your solution to win {bounty.bountyBTC} BTC
          </p>
        </header>

        <SubmitSolutionForm bounty={bounty} bountyID={bountyId} />
      </div>
    </main>
  );
};
