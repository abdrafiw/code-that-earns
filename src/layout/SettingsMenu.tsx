import { Settings } from 'lucide-react';
import { Button } from '../components/ui/button';

import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '../components/ui/dialog';

import { useAppContext } from '../hooks/useAppContext';
import { USER_ROLE_LABELS } from '../utils/userRole';

export function SettingsMenu() {
  const { user } = useAppContext();
  const profile = user?.success ? user.user : null;

  return (
    <Dialog>
      <DialogTrigger asChild>
        <Button
          variant="ghost"
          size="icon"
          aria-label="Settings"
          title="Settings"
          className="text-gray-600 hover:bg-gray-100 hover:text-gray-950"
        >
          <Settings aria-hidden="true" className="size-5" />
        </Button>
      </DialogTrigger>

      <DialogContent>
        <DialogHeader>
          <DialogTitle>Settings</DialogTitle>
          <DialogDescription>Your account details.</DialogDescription>
        </DialogHeader>

        {profile ? (
          <dl className="divide-y divide-gray-100 text-sm">
            {[
              ['Name', profile.companyName || profile.name || 'Not provided'],
              ['Email', profile.email],
              ['Account type', USER_ROLE_LABELS[profile.role]],
            ].map(([label, value]) => (
              <div key={label} className="py-3">
                <dt className="text-gray-500">{label}</dt>
                <dd className="mt-1 font-medium wrap-break-word text-gray-950">
                  {value}
                </dd>
              </div>
            ))}
          </dl>
        ) : (
          <p className="text-sm text-gray-500">
            Sign in to view your account details.
          </p>
        )}
      </DialogContent>
    </Dialog>
  );
}
