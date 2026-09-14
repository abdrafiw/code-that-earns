import { useState, type FormEvent } from 'react';
import { format } from 'date-fns';

import { CalendarDays, ChevronDownIcon, Plus } from 'lucide-react';

import { toast } from 'sonner';
import { getErrorMessage } from '../../../utils/getErrorMessage';
import { useCreateChallenge } from '../hooks/useChallenges';
import { Button } from '../../../components/ui/button';
import { Input } from '../../../components/ui/input';
import { Label } from '../../../components/ui/label';
import { Textarea } from '../../../components/ui/textarea';

import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '../../../components/ui/select';

import { Calendar } from '../../../components/ui/calendar';

import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '../../../components/ui/dialog';

import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '../../../components/ui/popover';

import { useTypedForm } from '../../../hooks/useTypedForm';
import { FormErrorSummary } from '../../../components/common/FormErrorSummary';
import { ChallengeOutcomeFields } from './ChallengeOutcomeFields';

import {
  hasFormErrors,
  validateChallenge,
  type ChallengeFormValues,
} from '../../../utils/formSchemas';

const initialForm: ChallengeFormValues = {
  title: '',
  description: '',
  category: '',
  difficulty: '',
  outcomeType: 'recognition',
  recognitionLabel: 'Winner',
  amountMajor: '',
  currency: 'USD',
  rewardDescription: '',
  deliveryTerms: '',
  winnerCount: 1,
  eligibility: 'Open to all developers.',
  geographicRestrictions: 'None',
  deadline: undefined,
};

export const CreateChallengeDialog = () => {
  const [open, setOpen] = useState(false);
  const [calendarOpen, setCalendarOpen] = useState(false);
  const form = useTypedForm(initialForm);
  const createChallengeMutation = useCreateChallenge();

  const handleSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const errors = validateChallenge(form.values);
    form.setErrors(errors);
    if (hasFormErrors(errors) || !form.values.deadline) return;

    const payload = {
      title: form.values.title.trim(),
      description: form.values.description.trim(),
      category: form.values.category,
      difficulty: form.values.difficulty,
      outcome: {
        type: form.values.outcomeType,
        ...(form.values.recognitionLabel.trim()
          ? { recognitionLabel: form.values.recognitionLabel.trim() }
          : {}),
        ...(form.values.amountMajor.trim()
          ? {
              amountMinor: Math.round(Number(form.values.amountMajor) * 100),
              currency: form.values.currency.trim().toUpperCase(),
            }
          : {}),
        ...(form.values.rewardDescription.trim()
          ? { rewardDescription: form.values.rewardDescription.trim() }
          : {}),
        ...(form.values.deliveryTerms.trim()
          ? { deliveryTerms: form.values.deliveryTerms.trim() }
          : {}),
      },
      winnerCount: form.values.winnerCount,
      eligibility: form.values.eligibility.trim(),
      geographicRestrictions: form.values.geographicRestrictions.trim(),
      deadline: form.values.deadline,
    };

    createChallengeMutation.mutate(payload, {
      onSuccess: () => {
        toast.success('Challenge created successfully!');
        form.reset();
        setOpen(false);
      },
      onError: (error) => {
        toast.error(getErrorMessage(error));
      },
    });
  };

  return (
    <Dialog
      open={open}
      onOpenChange={(nextOpen) => {
        setOpen(nextOpen);
        if (!nextOpen && !createChallengeMutation.isPending) form.reset();
      }}
    >
      <DialogTrigger asChild>
        <Button className="cursor-pointer">
          <Plus className="size-4" />
          Create challenge
        </Button>
      </DialogTrigger>

      <DialogContent className="max-h-[90vh] overflow-y-auto sm:max-w-2xl">
        <DialogHeader>
          <DialogTitle>Create a new challenge</DialogTitle>
          <DialogDescription>
            Define a focused challenge and invite developers to submit their
            solutions.
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-5">
          <FormErrorSummary errors={form.errors} />
          {/* title */}
          <div className="space-y-2">
            <Label htmlFor="challenge-title">Title</Label>
            <Input
              id="challenge-title"
              value={form.values.title}
              onChange={(event) => form.setField('title', event.target.value)}
              placeholder="build a React todo app"
              aria-invalid={!!form.errors.title}
            />
          </div>

          {/* description */}
          <div className="space-y-2">
            <Label htmlFor="challenge-description">Description</Label>
            <Textarea
              id="challenge-description"
              value={form.values.description}
              onChange={(event) =>
                form.setField('description', event.target.value)
              }
              placeholder="Describe the challenge and expected outcome..."
              className="min-h-28"
              aria-invalid={!!form.errors.description}
            />
          </div>

          {/* category && difficulty */}
          <div className="grid gap-4 sm:grid-cols-2">
            {/* category */}
            <div className="space-y-2">
              <Label htmlFor="challenge-category">Category</Label>
              <Select
                value={form.values.category}
                onValueChange={(value) => form.setField('category', value)}
              >
                <SelectTrigger id="challenge-category" className="w-full">
                  <SelectValue placeholder="Select category" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Coding">Coding</SelectItem>
                  <SelectItem value="Data Analysis">Data Analysis</SelectItem>
                  <SelectItem value="Blockchain">Blockchain</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* difficulty */}
            <div className="space-y-2">
              <Label htmlFor="challenge-difficulty">Difficulty</Label>
              <Select
                value={form.values.difficulty}
                onValueChange={(value) => form.setField('difficulty', value)}
              >
                <SelectTrigger id="challenge-difficulty" className="w-full">
                  <SelectValue placeholder="Select difficulty" />
                </SelectTrigger>

                <SelectContent>
                  <SelectItem value="Beginner">Beginner</SelectItem>
                  <SelectItem value="Intermediate">Intermediate</SelectItem>
                  <SelectItem value="Advanced">Advanced</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <ChallengeOutcomeFields
            values={form.values}
            setField={form.setField}
          />
          <div className="grid gap-4 sm:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="eligibility">Eligibility</Label>
              <Textarea
                id="eligibility"
                value={form.values.eligibility}
                onChange={(event) =>
                  form.setField('eligibility', event.target.value)
                }
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="geography">Geographic restrictions</Label>
              <Textarea
                id="geography"
                value={form.values.geographicRestrictions}
                onChange={(event) =>
                  form.setField('geographicRestrictions', event.target.value)
                }
              />
            </div>
          </div>
          <div className="space-y-2">
            <Label htmlFor="challenge-deadline">Deadline</Label>
            <Popover open={calendarOpen} onOpenChange={setCalendarOpen}>
              <PopoverTrigger asChild>
                <Button
                  type="button"
                  variant="outline"
                  id="challenge-deadline"
                  className="w-full justify-start font-normal text-gray-500"
                >
                  <CalendarDays className="mr-2 size-4" />
                  {form.values.deadline
                    ? format(form.values.deadline, 'PPP')
                    : 'Select deadline'}
                  <ChevronDownIcon className="ml-auto size-4 opacity-50" />
                </Button>
              </PopoverTrigger>

              <PopoverContent className="w-auto p-0" align="start">
                <Calendar
                  mode="single"
                  selected={form.values.deadline}
                  captionLayout="dropdown"
                  onSelect={(date) => {
                    form.setField('deadline', date);
                    setCalendarOpen(false);
                  }}
                  disabled={(date) => date < new Date()}
                  initialFocus
                />
              </PopoverContent>
            </Popover>
          </div>
          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              onClick={() => setOpen(false)}
              disabled={createChallengeMutation.isPending}
            >
              Cancel
            </Button>

            <Button type="submit" disabled={createChallengeMutation.isPending}>
              {createChallengeMutation.isPending
                ? 'Publishing challenge…'
                : 'Publish challenge'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
};
