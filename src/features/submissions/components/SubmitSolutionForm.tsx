import { type FormEvent } from 'react';
import { useNavigate } from 'react-router-dom';
import { toast } from 'sonner';
import { SiGithub } from 'react-icons/si';
import { Input } from '../../../components/ui/input';
import { Button } from '../../../components/ui/button';
import { Label } from '../../../components/ui/label';
import { useSubmitSolution } from '../hooks/useSubmissions';
import { useTypedForm } from '../../../hooks/useTypedForm';
import {
  hasFormErrors,
  validateSubmission,
  type SubmissionFormValues,
} from '../../../utils/formSchemas';
import { getErrorMessage } from '../../../utils/getErrorMessage';

const initialValues: SubmissionFormValues = {
  githubUrl: '',
  bitcoinAddress: '',
};

type SubmitSolutionFormProps = {
  challengeID: string;
};

export const SubmitSolutionForm = ({
  challengeID,
}: SubmitSolutionFormProps) => {
  const form = useTypedForm(initialValues);

  const navigate = useNavigate();

  const submitSolutionMutation = useSubmitSolution();

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();

    const errors = validateSubmission(form.values);
    form.setErrors(errors);
    if (hasFormErrors(errors)) {
      toast.error('Please fill in all fields.');
      return;
    }

    const payload = {
      githubUrl: form.values.githubUrl.trim(),
      bitcoinAddress: form.values.bitcoinAddress.trim(),
      challengeID,
    };

    submitSolutionMutation.mutate(payload, {
      onSuccess: () => {
        toast.success('Solution submitted successfully.');
        form.reset();
        navigate('/submissions');
      },
      onError: (error) => {
        toast.error(getErrorMessage(error));
      },
    });
  };

  return (
    <form
      onSubmit={handleSubmit}
      className="space-y-6 rounded-xl border border-gray-200 bg-white p-6 shadow-sm"
    >
      <header>
        <h2 className="text-xl font-semibold text-gray-950">
          Submit your solution
        </h2>
        <p className="mt-1 text-sm leading-6 text-gray-500">
          Share your repository and payout address for review.
        </p>
      </header>

      <div className="space-y-6">
        <div className="space-y-2">
          <Label htmlFor="github-url">GitHub repository</Label>
          <div className="relative">
            <SiGithub className="text-muted-foreground absolute top-1/2 left-3 h-4 w-4 -translate-y-1/2" />
            <Input
              id="github-url"
              type="url"
              value={form.values.githubUrl}
              onChange={(e) => form.setField('githubUrl', e.target.value)}
              className="pl-10"
              placeholder="https://github.com/username/project"
              aria-invalid={!!form.errors.githubUrl}
              aria-describedby={
                form.errors.githubUrl ? 'github-url-error' : undefined
              }
            />
          </div>
          {form.errors.githubUrl && (
            <p id="github-url-error" className="text-destructive text-sm">
              {form.errors.githubUrl}
            </p>
          )}
        </div>

        <div className="space-y-2">
          <Label htmlFor="btc-address">Bitcoin payout address</Label>
          <Input
            id="btc-address"
            type="text"
            value={form.values.bitcoinAddress}
            onChange={(e) => form.setField('bitcoinAddress', e.target.value)}
            placeholder="bc1qxy2kgdygjrsqtzq2n0yrf2493p83kkfjhx0wlh"
            aria-invalid={!!form.errors.bitcoinAddress}
            aria-describedby={
              form.errors.bitcoinAddress ? 'btc-address-error' : undefined
            }
          />
          <p className="text-xs text-gray-500">
            Rewards will be sent to this address if your solution is selected.
          </p>
          {form.errors.bitcoinAddress && (
            <p id="btc-address-error" className="text-destructive text-sm">
              {form.errors.bitcoinAddress}
            </p>
          )}
        </div>

        <div className="flex flex-col gap-3">
          <Button
            type="submit"
            disabled={submitSolutionMutation.isPending}
            className="flex-1"
            size="lg"
          >
            {submitSolutionMutation.isPending
              ? 'Submitting...'
              : 'Submit solution'}
          </Button>

          <Button
            type="button"
            variant="outline"
            onClick={() => navigate('/challenges')}
            size="lg"
          >
            Cancel
          </Button>
        </div>
      </div>
    </form>
  );
};
