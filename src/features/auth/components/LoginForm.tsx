import { Mail, Lock, Eye, EyeOff } from 'lucide-react';
import { useState, type FormEvent } from 'react';
import { Link } from 'react-router-dom';
import { toast } from 'sonner';
import { Input } from '../../../components/ui/input';
import { Button } from '../../../components/ui/button';
import { Label } from '../../../components/ui/label';

import { useLogin } from '../hooks/useAuth';
import { validateEmail } from '../utils/validateEmail';

export const LoginForm = () => {
  const [loginForm, setLoginForm] = useState({
    email: '',
    password: '',
  });
  const [emailError, setEmailError] = useState('');
  const [showPassword, setShowPassword] = useState(false);

  const loginMutation = useLogin();

  const handleEmailChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const email = e.target.value;
    setLoginForm({ ...loginForm, email });

    if (email === '') {
      setEmailError('');
    } else if (!validateEmail(email)) {
      setEmailError('Please enter a valid email address');
    } else {
      setEmailError('');
    }
  };

  const handleLogin = (e: FormEvent) => {
    e.preventDefault();

    if (!loginForm.password || !loginForm.email) {
      toast.error('Please add email and password');
      return;
    }

    if (!validateEmail(loginForm.email)) {
      toast.error('Please enter a valid email address');
      return;
    }

    const payload = {
      email: loginForm.email,
      password: loginForm.password,
    };

    loginMutation.mutate(payload);
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
              value={loginForm.email}
              onChange={handleEmailChange}
              className={`h-11 bg-slate-50 pl-10 focus-visible:bg-white ${emailError ? 'border-destructive' : ''}`}
              placeholder="your@email.com"
              aria-invalid={!!emailError}
            />
          </div>
          {emailError && (
            <p className="text-destructive text-sm">{emailError}</p>
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
              value={loginForm.password}
              onChange={(e) =>
                setLoginForm({ ...loginForm, password: e.target.value })
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
      </div>

      <Button
        type="submit"
        disabled={loginMutation.isPending || !!emailError}
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
