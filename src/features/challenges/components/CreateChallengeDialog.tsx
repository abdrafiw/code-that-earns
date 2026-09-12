import { useState, type FormEvent } from 'react';
import { format } from 'date-fns';

import { Bitcoin, CalendarDays, ChevronDownIcon, Plus } from 'lucide-react';

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
  rewardBTC: 0.0001,
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
      rewardBTC: form.values.rewardBTC,
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

          {/* amount && deadline */}
          <div className="grid gap-4 sm:grid-cols-2">
            {/* challenge amount */}
            <div className="space-y-2">
              <Label htmlFor="challenge-amount">Challenge amount</Label>
              <div className="relative">
                <Bitcoin className="absolute top-1/2 left-3 size-4 -translate-y-1/2 text-gray-400" />
                <Input
                  id="challenge-amount"
                  disabled
                  value={form.values.rewardBTC}
                  className="pl-9"
                  aria-describedby="challenge-amount-note"
                />
              </div>
              <p id="challenge-amount-note" className="text-xs text-gray-500">
                BTC reward amount
              </p>
            </div>

            {/* deadline */}
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
