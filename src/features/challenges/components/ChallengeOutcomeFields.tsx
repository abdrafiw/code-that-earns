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
import type { ChallengeFormValues } from '../../../utils/formSchemas';

type ChallengeOutcomeFieldsProps = {
  values: ChallengeFormValues;
  setField: <K extends keyof ChallengeFormValues>(
    field: K,
    value: ChallengeFormValues[K],
  ) => void;
};

export function ChallengeOutcomeFields({
  values,
  setField,
}: ChallengeOutcomeFieldsProps) {
  const offersRecognition =
    values.outcomeType === 'recognition' ||
    values.outcomeType === 'recognition_and_reward';
  const offersMoney =
    values.outcomeType === 'monetary' ||
    values.outcomeType === 'recognition_and_reward';
  const offersReward = values.outcomeType !== 'recognition';

  return (
    <fieldset className="space-y-4">
      <legend className="text-sm font-semibold text-gray-950">
        Challenge outcome
      </legend>

      <div className="grid gap-4 sm:grid-cols-2">
        <div className="space-y-2">
          <Label htmlFor="outcome-type">Outcome</Label>
          <Select
            value={values.outcomeType}
            onValueChange={(value) =>
              setField(
                'outcomeType',
                value as ChallengeFormValues['outcomeType'],
              )
            }
          >
            <SelectTrigger id="outcome-type">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="recognition">Recognition only</SelectItem>
              <SelectItem value="monetary">Monetary reward</SelectItem>
              <SelectItem value="non_monetary">Non-monetary reward</SelectItem>
              <SelectItem value="recognition_and_reward">
                Recognition and reward
              </SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div className="space-y-2">
          <Label htmlFor="winner-count">Winner count</Label>
          <Input
            id="winner-count"
            type="number"
            min={1}
            max={10}
            value={values.winnerCount}
            onChange={(event) =>
              setField('winnerCount', Number(event.target.value))
            }
          />
        </div>
      </div>

      {offersRecognition && (
        <div className="space-y-2">
          <Label htmlFor="recognition-label">Recognition label</Label>
          <Input
            id="recognition-label"
            value={values.recognitionLabel}
            onChange={(event) =>
              setField('recognitionLabel', event.target.value)
            }
          />
        </div>
      )}

      {offersMoney && (
        <div className="grid gap-4 sm:grid-cols-2">
          <div className="space-y-2">
            <Label htmlFor="reward-amount">Reward per winner</Label>
            <Input
              id="reward-amount"
              inputMode="decimal"
              value={values.amountMajor}
              onChange={(event) => setField('amountMajor', event.target.value)}
              placeholder="100.00"
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="reward-currency">Currency</Label>
            <Input
              id="reward-currency"
              maxLength={3}
              value={values.currency}
              onChange={(event) =>
                setField('currency', event.target.value.toUpperCase())
              }
            />
          </div>
        </div>
      )}

      {values.outcomeType === 'non_monetary' && (
        <div className="space-y-2">
          <Label htmlFor="reward-description">Reward description</Label>
          <Textarea
            id="reward-description"
            value={values.rewardDescription}
            onChange={(event) =>
              setField('rewardDescription', event.target.value)
            }
          />
        </div>
      )}

      {offersReward && (
        <div className="space-y-2">
          <Label htmlFor="delivery-terms">Off-platform delivery terms</Label>
          <Textarea
            id="delivery-terms"
            value={values.deliveryTerms}
            onChange={(event) => setField('deliveryTerms', event.target.value)}
          />
        </div>
      )}
    </fieldset>
  );
}
