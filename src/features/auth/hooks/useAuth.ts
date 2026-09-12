import { useLocation, useNavigate } from 'react-router-dom';
import { toast } from 'sonner';
import { authService } from '../../../services/auth/authService';
import type { SignInPayload, SignUpPayload } from '../types';
import { useMutation } from '@tanstack/react-query';
import { getErrorMessage } from '../../../utils/getErrorMessage';

async function login(payload: SignInPayload) {
  const user = await authService.signIn(payload);
  return user;
}

function getRequestedPath(state: unknown) {
  if (typeof state !== 'object' || state === null || !('from' in state))
    return null;

  const from = state.from;
  if (
    typeof from !== 'object' ||
    from === null ||
    !('pathname' in from) ||
    typeof from.pathname !== 'string'
  )
    return null;

  const search =
    'search' in from && typeof from.search === 'string' ? from.search : '';
  const hash = 'hash' in from && typeof from.hash === 'string' ? from.hash : '';
  return `${from.pathname}${search}${hash}`;
}

export const useLogin = () => {
  const navigate = useNavigate();
  const location = useLocation();

  return useMutation({
    mutationFn: login,
    onSuccess: (data) => {
      toast.success('Login successful');
      const requestedPath = getRequestedPath(location.state);

      if (requestedPath) {
        navigate(requestedPath, { replace: true });
        return;
      }

      if (data.role === 'COMPANY' || data.role === 'DEVELOPER') {
        navigate('/challenges', { replace: true });
      } else {
        navigate('/', { replace: true });
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
    onSuccess: () => {
      toast.success('Signup successful');

      navigate('/challenges');
    },
    onError: (error: Error) => {
      toast.error(getErrorMessage(error));
    },
  });
};
