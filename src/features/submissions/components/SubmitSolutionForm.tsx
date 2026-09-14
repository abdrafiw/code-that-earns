import { type SubmitEvent } from 'react';
import { useNavigate } from 'react-router-dom';
import { toast } from 'sonner';
import { SiGithub } from 'react-icons/si';
import { ExternalLink } from 'lucide-react';
import { Input } from '../../../components/ui/input';
import { Button } from '../../../components/ui/button';
import { Label } from '../../../components/ui/label';
import { Textarea } from '../../../components/ui/textarea';
import { useSubmitSolution } from '../hooks/useSubmissions';
import { useTypedForm } from '../../../hooks/useTypedForm';
import {
  hasFormErrors,
  validateSubmission,
  type SubmissionFormValues,
} from '../../../utils/formSchemas';
import { getErrorMessage } from '../../../utils/getErrorMessage';
import { isDesignChallenge } from '../../challenges/constants';

const initialValues: SubmissionFormValues = {
  submissionUrl: '',
  liveDemoUrl: '',
  notes: '',
  publicWinnerConsent: false,
};

type SubmitSolutionFormProps = {
  challengeID: string;
  challengeCategory?: string;
  unavailableReason?: string;
};

export const SubmitSolutionForm = ({
  challengeID,
  challengeCategory,
  unavailableReason,
}: SubmitSolutionFormProps) => {
  const form = useTypedForm(initialValues);

  const navigate = useNavigate();

  const submitSolutionMutation = useSubmitSolution();
  const requiresDesignLink = isDesignChallenge(challengeCategory);
  const hasRequiredFields = Boolean(
    form.values.submissionUrl.trim() && !unavailableReason,
  );

  const handleSubmit = async (e: SubmitEvent<HTMLFormElement>) => {
    e.preventDefault();

    if (unavailableReason) {
      toast.error(unavailableReason);
      return;
    }

    const errors = validateSubmission(form.values, challengeCategory);
    form.setErrors(errors);
    if (hasFormErrors(errors)) {
      toast.error('Please fill in all fields.');
      return;
    }

    const payload = {
      submissionUrl: form.values.submissionUrl.trim(),
      liveDemoUrl: form.values.liveDemoUrl.trim() || undefined,
      notes: form.values.notes.trim() || undefined,
      publicWinnerConsent: form.values.publicWinnerConsent,
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
      <header className="space-y-1">
        <h2 className="text-xl font-semibold text-gray-950">
          Submit your solution
        </h2>
        <p className="text-sm leading-6 text-gray-500">
          {requiresDesignLink
            ? 'Share a Figma, Behance, or Dribbble project for review.'
            : 'Share your repository and optional supporting details for review.'}
        </p>
      </header>

      <div className="space-y-6">
        <div className="space-y-2">
          <Label htmlFor="submission-url">
            {requiresDesignLink ? 'Design project link' : 'GitHub repository'}
          </Label>
          <div className="relative">
            {requiresDesignLink ? (
              <ExternalLink
                aria-hidden="true"
                className="text-muted-foreground absolute top-1/2 left-3 h-4 w-4 -translate-y-1/2"
              />
            ) : (
              <SiGithub
                aria-hidden="true"
                className="text-muted-foreground absolute top-1/2 left-3 h-4 w-4 -translate-y-1/2"
              />
            )}
            <Input
              id="submission-url"
              type="url"
              required
              maxLength={2048}
              value={form.values.submissionUrl}
              onChange={(e) => form.setField('submissionUrl', e.target.value)}
              className="pl-10"
              placeholder={
                requiresDesignLink
                  ? 'https://www.figma.com/design/...'
                  : 'https://github.com/username/project'
              }
              aria-invalid={!!form.errors.submissionUrl}
              aria-describedby={
                form.errors.submissionUrl ? 'submission-url-error' : undefined
              }
            />
          </div>
          {form.errors.submissionUrl && (
            <p id="submission-url-error" className="text-destructive text-sm">
              {form.errors.submissionUrl}
            </p>
          )}
        </div>

        <div className="space-y-2">
          <Label htmlFor="demo-url">Live demo (optional)</Label>
          <Input
            id="demo-url"
            type="url"
            maxLength={2048}
            value={form.values.liveDemoUrl}
            onChange={(e) => form.setField('liveDemoUrl', e.target.value)}
            placeholder="https://example.com/demo"
            aria-invalid={!!form.errors.liveDemoUrl}
          />
          {form.errors.liveDemoUrl && (
            <p className="text-destructive text-sm">
              {form.errors.liveDemoUrl}
            </p>
          )}
        </div>
        <div className="space-y-2">
          <Label htmlFor="submission-notes">Notes (optional)</Label>
          <Textarea
            id="submission-notes"
            value={form.values.notes}
            onChange={(e) => form.setField('notes', e.target.value)}
            maxLength={2000}
          />
        </div>
        <label className="flex items-start gap-2 text-sm text-gray-600">
          <input
            type="checkbox"
            checked={form.values.publicWinnerConsent}
            onChange={(event) =>
              form.setField('publicWinnerConsent', event.target.checked)
            }
          />
          Show my display name publicly if I win. I can otherwise be shown as
          “Private winner”.
        </label>

        <div className="flex flex-col gap-3">
          {unavailableReason && (
            <p role="status" className="text-sm text-amber-700">
              {unavailableReason}
            </p>
          )}
          <Button
            type="submit"
            disabled={submitSolutionMutation.isPending || !hasRequiredFields}
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
