import { useState, type FormEvent } from 'react';
import { Mail, Lock, Eye, EyeOff } from 'lucide-react';
import { Link } from 'react-router-dom';
import { toast } from 'sonner';
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

export const SignUpForm = () => {
  const [signupForm, setSignupForm] = useState({
    name: '',
    companyName: '',
    email: '',
    password: '',
    confirmPassword: '',
    role: '',
  });
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const signUpMutation = useSignUp();

  const roleOptions: readonly UserRole[] = USER_ROLES;

  const handleSignUp = (e: FormEvent) => {
    e.preventDefault();

    if (signupForm.password !== signupForm.confirmPassword) {
      toast.error('Passwords do not match!');
      return;
    }

    if (!signupForm.role || !signupForm.email || !signupForm.password) {
      toast.error('Please fill in all required fields');
      return;
    }

    const payload: SignUpPayload = {
      email: signupForm.email,
      password: signupForm.password,
      role: signupForm.role as UserRole,
    };

    if (signupForm.role === 'DEVELOPER') {
      payload.name = signupForm.name || 'New User';
    } else if (signupForm.role === 'COMPANY') {
      payload.companyName = signupForm.companyName;
    }

    signUpMutation.mutate(payload);
  };

  return (
    <form onSubmit={handleSignUp} className="space-y-4 sm:space-y-5">
      <div className="grid gap-3.5 sm:grid-cols-2 sm:gap-4">
        {/* email */}
        <div className="space-y-2">
          <Label
            htmlFor="signup-email"
            className="text-sm font-medium text-slate-700"
          >
            Email address
          </Label>
          <div className="relative">
            <Mail className="text-muted-foreground absolute top-1/2 left-3 h-4 w-4 -translate-y-1/2" />
            <Input
              id="signup-email"
              type="email"
              autoComplete="email"
              required
              value={signupForm.email}
              onChange={(e) =>
                setSignupForm({ ...signupForm, email: e.target.value })
              }
              className="h-11 bg-slate-50 pl-10 focus-visible:bg-white"
              placeholder="your@email.com"
            />
          </div>
        </div>

        {signupForm.role === 'DEVELOPER' || signupForm.role === '' ? (
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
              value={signupForm.name}
              onChange={(e) =>
                setSignupForm({ ...signupForm, name: e.target.value })
              }
              placeholder="John Doe"
              className="h-11 bg-slate-50 focus-visible:bg-white"
            />
          </div>
        ) : (
          <div className="space-y-2">
            <Label
              htmlFor="company-name"
              className="text-sm font-medium text-slate-700"
            >
              Company name
            </Label>
            <Input
              id="company-name"
              type="text"
              autoComplete="organization"
              required
              value={signupForm.companyName}
              onChange={(e) =>
                setSignupForm({
                  ...signupForm,
                  companyName: e.target.value,
                })
              }
              placeholder="Your Company Inc."
              className="h-11 bg-slate-50 focus-visible:bg-white"
            />
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
            value={signupForm.role}
            onValueChange={(value) =>
              setSignupForm({
                ...signupForm,
                role: value as UserRole,
              })
            }
          >
            <SelectTrigger id="signup-role" className="h-11 w-full bg-slate-50">
              <SelectValue placeholder="Select your role" />
            </SelectTrigger>

            <SelectContent className="">
              {roleOptions.map((role) => (
                <SelectItem key={role} value={role}>
                  {role.charAt(0) + role.slice(1).toLowerCase()}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
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
            <Lock className="text-muted-foreground absolute top-1/2 left-3 h-4 w-4 -translate-y-1/2" />
            <Input
              id="signup-password"
              type={showPassword ? 'text' : 'password'}
              required
              autoComplete="new-password"
              value={signupForm.password}
              onChange={(e) =>
                setSignupForm({ ...signupForm, password: e.target.value })
              }
              className="h-11 bg-slate-50 pr-10 pl-10 focus-visible:bg-white"
              placeholder="••••••••"
            />
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              className="text-muted-foreground hover:text-foreground absolute top-1/2 right-3 -translate-y-1/2 transition-colors"
              aria-label={showPassword ? 'Hide password' : 'Show password'}
            >
              {showPassword ? (
                <EyeOff className="h-4 w-4" />
              ) : (
                <Eye className="h-4 w-4" />
              )}
            </button>
          </div>
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
            <Lock className="text-muted-foreground absolute top-1/2 left-3 h-4 w-4 -translate-y-1/2" />
            <Input
              id="confirm-password"
              type={showConfirmPassword ? 'text' : 'password'}
              required
              autoComplete="new-password"
              value={signupForm.confirmPassword}
              onChange={(e) =>
                setSignupForm({
                  ...signupForm,
                  confirmPassword: e.target.value,
                })
              }
              className="h-11 bg-slate-50 pr-10 pl-10 focus-visible:bg-white"
              placeholder="••••••••"
            />
            <button
              type="button"
              onClick={() => setShowConfirmPassword(!showConfirmPassword)}
              className="text-muted-foreground hover:text-foreground absolute top-1/2 right-3 -translate-y-1/2 transition-colors"
              aria-label={
                showConfirmPassword ? 'Hide password' : 'Show password'
              }
            >
              {showConfirmPassword ? (
                <EyeOff className="h-4 w-4" />
              ) : (
                <Eye className="h-4 w-4" />
              )}
            </button>
          </div>
        </div>
      </div>

      <Button
        type="submit"
        className="h-11 w-full bg-orange-600 font-semibold hover:bg-orange-700"
        size="lg"
        disabled={signUpMutation.isPending}
      >
        {signUpMutation.isPending ? 'Creating account...' : 'Create Account'}
      </Button>

      <div className="flex items-center justify-center gap-1.5 border-t border-slate-100 pt-4 text-center text-sm sm:pt-5">
        <p className="text-slate-500">Already have an account?</p>
        <Link
          to="/login"
          className="font-semibold text-orange-600 hover:text-orange-700"
        >
          Sign in
        </Link>
      </div>
    </form>
  );
};
