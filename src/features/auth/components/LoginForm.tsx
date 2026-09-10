import { Mail, Lock, Eye, EyeOff } from 'lucide-react';
import { useState, type FormEvent } from 'react';
import { Link } from 'react-router-dom';
import { Input } from '../../../components/ui/input';
import { Button } from '../../../components/ui/button';
import { Label } from '../../../components/ui/label';

import { useLogin } from '../hooks/useAuth';
import { useTypedForm } from '../../../hooks/useTypedForm';
import {
  hasFormErrors,
  validateLogin,
  type LoginFormValues,
} from '../../../utils/formSchemas';

const initialValues: LoginFormValues = { email: '', password: '' };

export const LoginForm = () => {
  const form = useTypedForm(initialValues);
  const [showPassword, setShowPassword] = useState(false);

  const loginMutation = useLogin();

  const handleLogin = (e: FormEvent) => {
    e.preventDefault();
    const errors = validateLogin(form.values);
    form.setErrors(errors);
    if (hasFormErrors(errors)) return;
    loginMutation.mutate({
      email: form.values.email.trim(),
      password: form.values.password,
    });
  };

  return (
    <form onSubmit={handleLogin} className="space-y-6">
      <div className="space-y-5">
        {/* email */}
        <div className="space-y-2">
          <Label htmlFor="email" className="text-sm font-medium text-slate-700">
            Email address
          </Label>
          <div className="relative">
            <Mail className="text-muted-foreground absolute top-1/2 left-3 h-4 w-4 -translate-y-1/2" />
            <Input
              id="email"
              type="email"
              autoComplete="email"
              required
              value={form.values.email}
              onChange={(event) => {
                const email = event.target.value;
                form.setField('email', email);
                form.setErrors(
                  email
                    ? { email: validateLogin({ ...form.values, email }).email }
                    : {},
                );
              }}
              className={`h-11 bg-slate-50 pl-10 focus-visible:bg-white ${form.errors.email ? 'border-destructive' : ''}`}
              placeholder="your@email.com"
              aria-invalid={!!form.errors.email}
              aria-describedby={
                form.errors.email ? 'login-email-error' : undefined
              }
            />
          </div>
          {form.errors.email && (
            <p id="login-email-error" className="text-destructive text-sm">
              {form.errors.email}
            </p>
          )}
        </div>

        {/* password */}
        <div className="space-y-2">
          <Label
            htmlFor="password"
            className="text-sm font-medium text-slate-700"
          >
            Password
          </Label>
          <div className="relative">
            <Lock className="text-muted-foreground absolute top-1/2 left-3 h-4 w-4 -translate-y-1/2" />
            <Input
              id="password"
              type={showPassword ? 'text' : 'password'}
              autoComplete="current-password"
              required
              value={form.values.password}
              onChange={(event) =>
                form.setField('password', event.target.value)
              }
              className="h-11 bg-slate-50 pr-10 pl-10 focus-visible:bg-white"
              placeholder="••••••••"
              aria-invalid={!!form.errors.password}
              aria-describedby={
                form.errors.password ? 'login-password-error' : undefined
              }
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
          {form.errors.password && (
            <p id="login-password-error" className="text-destructive text-sm">
              {form.errors.password}
            </p>
          )}
        </div>
      </div>

      <Button
        type="submit"
        disabled={loginMutation.isPending || Boolean(form.errors.email)}
        className="h-11 w-full cursor-pointer bg-orange-600 font-semibold hover:bg-orange-700"
        size="lg"
      >
        {loginMutation.isPending ? 'Signing in...' : 'Sign in'}
      </Button>

      <div className="flex items-center justify-center gap-1.5 border-t border-slate-100 pt-5 text-center text-sm">
        <p className="text-slate-500">Don&apos;t have an account?</p>

        <Link
          to="/sign-up"
          className="font-semibold text-orange-600 hover:text-orange-700"
        >
          Sign up
        </Link>
      </div>
    </form>
  );
};
