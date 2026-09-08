import { useNavigate } from 'react-router-dom';
import { toast } from 'sonner';
import { authService } from '../../../services/auth/authService';
import type { SignInPayload, SignUpPayload } from '../types';
import { useMutation } from '@tanstack/react-query';
import { getErrorMessage } from '../../../utils/getErrorMessage';

async function login(payload: SignInPayload) {
  const user = await authService.signIn(payload);
  return user;
}

export const useLogin = () => {
  const navigate = useNavigate();

  return useMutation({
    mutationFn: login,
    onSuccess: (data) => {
      if (!data.success) {
        toast.error(getErrorMessage(data.error));
        return;
      }

      toast.success('Login successful');

      if (data.user.role === 'COMPANY') {
        navigate('/company-bounties');
      } else if (data.user.role === 'DEVELOPER') {
        navigate('/dev-bounties');
      } else {
        navigate('/');
      }
    },
    onError: (error: Error) => {
      toast.error(getErrorMessage(error));
    },
  });
};

async function signUp(payload: SignUpPayload) {
  const user = await authService.signUp(payload);
  return user;
}

export const useSignUp = () => {
  const navigate = useNavigate();

  return useMutation({
    mutationFn: signUp,
    onSuccess: (data) => {
      if (!data.success) {
        toast.error(getErrorMessage(data.error));
        return;
      }

      toast.success('Signup successful');

      if (data.user.role === 'COMPANY') {
        navigate('/company-bounties');
      } else {
        navigate('/dev-bounties');
      }
    },
    onError: (error: Error) => {
      toast.error(getErrorMessage(error));
    },
  });
};
