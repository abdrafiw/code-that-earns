import { useState, type SubmitEvent } from 'react';
import { Mail, Lock, Eye, EyeOff } from 'lucide-react';
import { Link } from 'react-router-dom';
import { Input } from '../../../components/ui/input';
import { Button } from '../../../components/ui/button';
import { Label } from '../../../components/ui/label';

import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '../../../components/ui/select';

import { useSignUp } from '../hooks/useAuth';
import type { SignUpPayload, UserRole } from '../types';
import { USER_ROLES } from '../../../services/firestore-structure';
import { useTypedForm } from '../../../hooks/useTypedForm';
import { FormErrorSummary } from '../../../components/common/FormErrorSummary';
import {
  hasFormErrors,
  validateSignUp,
  type SignUpFormValues,
} from '../../../utils/formSchemas';
import { USER_ROLE_OPTION_LABELS } from '../../../utils/userRole';

const initialValues: SignUpFormValues = {
  name: '',
  companyName: '',
  email: '',
  password: '',
  confirmPassword: '',
  role: null,
};

export const SignUpForm = () => {
  const form = useTypedForm(initialValues);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const signUpMutation = useSignUp();

  const roleOptions: readonly UserRole[] = USER_ROLES;
  const hasRequiredFields = Boolean(
    form.values.email.trim() &&
    form.values.role &&
    (form.values.role === 'DEVELOPER'
      ? form.values.name.trim()
      : form.values.companyName.trim()) &&
    form.values.password &&
    form.values.confirmPassword,
  );

  const handleSignUp = (e: SubmitEvent<HTMLFormElement>) => {
    e.preventDefault();

    const errors = validateSignUp(form.values);
    form.setErrors(errors);
    if (hasFormErrors(errors) || !form.values.role) return;

    const payload: SignUpPayload = {
      email: form.values.email.trim(),
      password: form.values.password,
      role: form.values.role,
    };

    if (form.values.role === 'DEVELOPER') {
      payload.name = form.values.name.trim();
    } else {
      payload.companyName = form.values.companyName.trim();
    }

    signUpMutation.mutate(payload);
  };

  return (
    <form onSubmit={handleSignUp} className="space-y-6">
      <FormErrorSummary errors={form.errors} />
      <div className="grid gap-4 sm:grid-cols-2">
        {/* email */}
        <div className="space-y-2">
          <Label
            htmlFor="signup-email"
            className="text-sm font-medium text-slate-700"
          >
            Email address
          </Label>
          <div className="relative">
            <Mail
              aria-hidden="true"
              className="text-muted-foreground absolute top-1/2 left-3 h-4 w-4 -translate-y-1/2"
            />
            <Input
              id="signup-email"
              type="email"
              autoComplete="email"
              required
              value={form.values.email}
              onChange={(e) => form.setField('email', e.target.value)}
              className="h-11 bg-slate-50 pl-10 focus-visible:bg-white"
              placeholder="your@email.com"
              aria-invalid={!!form.errors.email}
              aria-describedby={
                form.errors.email ? 'signup-email-error' : undefined
              }
            />
          </div>
          {form.errors.email && (
            <p id="signup-email-error" className="text-destructive text-sm">
              {form.errors.email}
            </p>
          )}
        </div>

        {form.values.role === 'DEVELOPER' || form.values.role === null ? (
          <div className="space-y-2">
            <Label
              htmlFor="name"
              className="text-sm font-medium text-slate-700"
            >
              Full name
            </Label>
            <Input
              id="name"
              type="text"
              autoComplete="name"
              required
              value={form.values.name}
              onChange={(e) => form.setField('name', e.target.value)}
              placeholder="John Doe"
              className="h-11 bg-slate-50 focus-visible:bg-white"
              aria-invalid={!!form.errors.name}
              aria-describedby={
                form.errors.name ? 'signup-name-error' : undefined
              }
            />
            {form.errors.name && (
              <p id="signup-name-error" className="text-destructive text-sm">
                {form.errors.name}
              </p>
            )}
          </div>
        ) : (
          <div className="space-y-2">
            <Label
              htmlFor="company-name"
              className="text-sm font-medium text-slate-700"
            >
              Organization name
            </Label>
            <Input
              id="company-name"
              type="text"
              autoComplete="organization"
              required
              value={form.values.companyName}
              onChange={(e) => form.setField('companyName', e.target.value)}
              placeholder="Your organization"
              className="h-11 bg-slate-50 focus-visible:bg-white"
              aria-invalid={!!form.errors.companyName}
              aria-describedby={
                form.errors.companyName ? 'signup-company-error' : undefined
              }
            />
            {form.errors.companyName && (
              <p id="signup-company-error" className="text-destructive text-sm">
                {form.errors.companyName}
              </p>
            )}
          </div>
        )}

        {/* role */}
        <div className="space-y-2 sm:col-span-2">
          <Label
            htmlFor="signup-role"
            className="text-sm font-medium text-slate-700"
          >
            Account type
          </Label>
          <Select
            value={form.values.role ?? undefined}
            onValueChange={(value: UserRole) => form.setField('role', value)}
          >
            <SelectTrigger
              id="signup-role"
              className="h-11 w-full bg-slate-50 data-[size=default]:h-11"
              aria-required="true"
              aria-invalid={!!form.errors.role}
              aria-describedby={
                form.errors.role ? 'signup-role-error' : undefined
              }
            >
              <SelectValue placeholder="Select your role" />
            </SelectTrigger>

            <SelectContent className="">
              {roleOptions.map((role) => (
                <SelectItem key={role} value={role}>
                  {USER_ROLE_OPTION_LABELS[role]}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          {form.errors.role && (
            <p id="signup-role-error" className="text-destructive text-sm">
              {form.errors.role}
            </p>
          )}
        </div>

        {/* password */}
        <div className="space-y-2">
          <Label
            htmlFor="signup-password"
            className="text-sm font-medium text-slate-700"
          >
            Password
          </Label>
          <div className="relative">
            <Lock
              aria-hidden="true"
              className="text-muted-foreground absolute top-1/2 left-3 h-4 w-4 -translate-y-1/2"
            />
            <Input
              id="signup-password"
              type={showPassword ? 'text' : 'password'}
              required
              autoComplete="new-password"
              value={form.values.password}
              onChange={(e) => form.setField('password', e.target.value)}
              className="h-11 bg-slate-50 pr-10 pl-10 focus-visible:bg-white"
              placeholder="••••••••"
              aria-invalid={!!form.errors.password}
              aria-describedby={
                form.errors.password ? 'signup-password-error' : undefined
              }
            />
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              className="text-muted-foreground hover:text-foreground absolute top-1/2 right-3 -translate-y-1/2 transition-colors"
              aria-label={showPassword ? 'Hide password' : 'Show password'}
              aria-pressed={showPassword}
            >
              {showPassword ? (
                <EyeOff aria-hidden="true" className="h-4 w-4" />
              ) : (
                <Eye aria-hidden="true" className="h-4 w-4" />
              )}
            </button>
          </div>
          {form.errors.password && (
            <p id="signup-password-error" className="text-destructive text-sm">
              {form.errors.password}
            </p>
          )}
        </div>

        {/* confirm password */}
        <div className="space-y-2">
          <Label
            htmlFor="confirm-password"
            className="text-sm font-medium text-slate-700"
          >
            Confirm password
          </Label>
          <div className="relative">
            <Lock
              aria-hidden="true"
              className="text-muted-foreground absolute top-1/2 left-3 h-4 w-4 -translate-y-1/2"
            />
            <Input
              id="confirm-password"
              type={showConfirmPassword ? 'text' : 'password'}
              required
              autoComplete="new-password"
              value={form.values.confirmPassword}
              onChange={(e) => form.setField('confirmPassword', e.target.value)}
              className="h-11 bg-slate-50 pr-10 pl-10 focus-visible:bg-white"
              placeholder="••••••••"
              aria-invalid={!!form.errors.confirmPassword}
              aria-describedby={
                form.errors.confirmPassword
                  ? 'signup-confirm-password-error'
                  : undefined
              }
            />
            <button
              type="button"
              onClick={() => setShowConfirmPassword(!showConfirmPassword)}
              className="text-muted-foreground hover:text-foreground absolute top-1/2 right-3 -translate-y-1/2 transition-colors"
              aria-label={
                showConfirmPassword ? 'Hide password' : 'Show password'
              }
              aria-pressed={showConfirmPassword}
            >
              {showConfirmPassword ? (
                <EyeOff aria-hidden="true" className="h-4 w-4" />
              ) : (
                <Eye aria-hidden="true" className="h-4 w-4" />
              )}
            </button>
          </div>
          {form.errors.confirmPassword && (
            <p
              id="signup-confirm-password-error"
              className="text-destructive text-sm"
            >
              {form.errors.confirmPassword}
            </p>
          )}
        </div>
      </div>

      <Button
        type="submit"
        className="h-11 w-full bg-indigo-500 font-semibold hover:bg-indigo-600"
        size="lg"
        disabled={signUpMutation.isPending || !hasRequiredFields}
      >
        {signUpMutation.isPending ? 'Creating account...' : 'Create Account'}
      </Button>

      <div className="flex items-center justify-center gap-1.5 border-t border-slate-100 pt-4 text-center text-sm sm:pt-5">
        <p className="text-slate-500">Already have an account?</p>
        <Link
          to="/login"
          className="font-semibold text-indigo-500 hover:text-indigo-600"
        >
          Sign in
        </Link>
      </div>
    </form>
  );
};
