import { useState, type FormEvent } from 'react';
import { format } from 'date-fns';

import { Bitcoin, CalendarDays, ChevronDownIcon, Plus } from 'lucide-react';

import { toast } from 'sonner';
import { useCreateBounty } from '../hooks/useBounties';
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

const initialForm = {
  title: '',
  description: '',
  category: '',
  difficulty: '',
  bountyBTC: 0.0001,
  deadline: undefined as Date | undefined,
};

export const CreateBountyDialog = () => {
  const [open, setOpen] = useState(false);
  const [calendarOpen, setCalendarOpen] = useState(false);
  const [form, setForm] = useState(initialForm);
  const createBountyMutation = useCreateBounty();

  const isFormValid = Boolean(
    form.title &&
    form.description &&
    form.category &&
    form.difficulty &&
    form.deadline,
  );

  const resetForm = () => setForm(initialForm);

  const handleSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    if (!isFormValid) {
      toast.error('Please fill in all required fields');
      return;
    }

    createBountyMutation.mutate(
      {
        title: form.title,
        description: form.description,
        category: form.category,
        difficulty: form.difficulty,
        bountyBTC: Number(form.bountyBTC),
        deadline: format(form.deadline!, 'yyyy-MM-dd'),
      },
      {
        onSuccess: () => {
          toast.success('Bounty created successfully!');
          resetForm();
          setOpen(false);
        },
        onError: (error) => {
          toast.error(error.message || 'Something went wrong');
        },
      },
    );
  };

  return (
    <Dialog
      open={open}
      onOpenChange={(nextOpen) => {
        setOpen(nextOpen);
        if (!nextOpen && !createBountyMutation.isPending) resetForm();
      }}
    >
      <DialogTrigger asChild>
        <Button>
          <Plus className="size-4" />
          Create bounty
        </Button>
      </DialogTrigger>

      <DialogContent className="max-h-[90vh] overflow-y-auto sm:max-w-2xl">
        <DialogHeader>
          <DialogTitle>Create a new bounty</DialogTitle>
          <DialogDescription>
            Define a focused challenge and invite developers to submit their
            solutions.
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-5">
          <div className="space-y-2">
            <Label htmlFor="bounty-title">Title</Label>
            <Input
              id="bounty-title"
              value={form.title}
              onChange={(event) =>
                setForm((current) => ({
                  ...current,
                  title: event.target.value,
                }))
              }
              placeholder="Build a React todo app"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="bounty-description">Description</Label>
            <Textarea
              id="bounty-description"
              value={form.description}
              onChange={(event) =>
                setForm((current) => ({
                  ...current,
                  description: event.target.value,
                }))
              }
              placeholder="Describe the challenge and expected outcome..."
              className="min-h-28"
            />
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="bounty-category">Category</Label>
              <Select
                value={form.category}
                onValueChange={(value) =>
                  setForm((current) => ({ ...current, category: value }))
                }
              >
                <SelectTrigger id="bounty-category" className="w-full">
                  <SelectValue placeholder="Select category" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Coding">Coding</SelectItem>
                  <SelectItem value="Data Analysis">Data Analysis</SelectItem>
                  <SelectItem value="Blockchain">Blockchain</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="bounty-difficulty">Difficulty</Label>
              <Select
                value={form.difficulty}
                onValueChange={(value) =>
                  setForm((current) => ({ ...current, difficulty: value }))
                }
              >
                <SelectTrigger id="bounty-difficulty" className="w-full">
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

          <div className="grid gap-4 sm:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="bounty-amount">Bounty amount</Label>
              <div className="relative">
                <Bitcoin className="absolute top-1/2 left-3 size-4 -translate-y-1/2 text-gray-400" />
                <Input
                  id="bounty-amount"
                  disabled
                  value={form.bountyBTC}
                  className="pl-9"
                  aria-describedby="bounty-amount-note"
                />
              </div>
              <p id="bounty-amount-note" className="text-xs text-gray-500">
                BTC reward amount
              </p>
            </div>

            <div className="space-y-2">
              <Label htmlFor="bounty-deadline">Deadline</Label>
              <Popover open={calendarOpen} onOpenChange={setCalendarOpen}>
                <PopoverTrigger asChild>
                  <Button
                    type="button"
                    variant="outline"
                    id="bounty-deadline"
                    className="w-full justify-start font-normal text-gray-500"
                  >
                    <CalendarDays className="mr-2 size-4" />
                    {form.deadline
                      ? format(form.deadline, 'PPP')
                      : 'Select deadline'}
                    <ChevronDownIcon className="ml-auto size-4 opacity-50" />
                  </Button>
                </PopoverTrigger>

                <PopoverContent className="w-auto p-0" align="start">
                  <Calendar
                    mode="single"
                    selected={form.deadline}
                    captionLayout="dropdown"
                    onSelect={(date) => {
                      setForm((current) => ({ ...current, deadline: date }));
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
              disabled={createBountyMutation.isPending}
            >
              Cancel
            </Button>

            <Button
              type="submit"
              disabled={createBountyMutation.isPending || !isFormValid}
            >
              {createBountyMutation.isPending
                ? 'Publishing bounty…'
                : 'Publish bounty'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
};
