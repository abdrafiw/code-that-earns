import {
  createContext,
  useCallback,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from 'react';
import { onAuthStateChanged } from 'firebase/auth';
import { doc, onSnapshot, type Unsubscribe } from 'firebase/firestore';

import type { AppContextType, AuthState } from './types';
import { auth, db } from '../config/firebase';
import { userConverter } from '../services/firestore-structure';

export const AppContext = createContext<AppContextType | undefined>(undefined);

export const AppProvider = ({ children }: { children: ReactNode }) => {
  const [authState, setAuthState] = useState<AuthState>({ status: 'loading' });
  const [profileRetry, setProfileRetry] = useState(0);

  useEffect(() => {
    let isActive = true;
    let profileSubscription: Unsubscribe | undefined;
    let authVersion = 0;

    const unsubscribeAuth = onAuthStateChanged(auth, (firebaseUser) => {
      authVersion += 1;
      const currentVersion = authVersion;
      profileSubscription?.();
      profileSubscription = undefined;
      setAuthState({ status: 'loading' });

      if (!firebaseUser) {
        setAuthState({ status: 'anonymous' });
        return;
      }

      profileSubscription = onSnapshot(
        doc(db, 'users', firebaseUser.uid).withConverter(userConverter),
        { includeMetadataChanges: true },
        (profileSnapshot) => {
          if (!isActive || currentVersion !== authVersion) return;

          if (!profileSnapshot.exists()) {
            if (profileSnapshot.metadata.fromCache) return;
            setAuthState({ status: 'profile-missing' });
            return;
          }

          try {
            const userData = profileSnapshot.data();
            setAuthState({
              status: 'authenticated',
              user: {
                success: true,
                user: {
                  ...userData,
                  uid: firebaseUser.uid,
                  email: firebaseUser.email ?? userData.email,
                  displayName: firebaseUser.displayName,
                },
              },
            });
          } catch (error) {
            setAuthState({ status: 'error', error });
          }
        },
        (error) => {
          if (!isActive || currentVersion !== authVersion) return;
          setAuthState({ status: 'error', error });
        },
      );
    });

    return () => {
      isActive = false;
      authVersion += 1;
      profileSubscription?.();
      unsubscribeAuth();
    };
  }, [profileRetry]);

  const user = authState.status === 'authenticated' ? authState.user : null;
  const retryAuthProfile = useCallback(
    () => setProfileRetry((attempt) => attempt + 1),
    [],
  );
  const contextValue = useMemo<AppContextType>(
    () => ({
      authState,
      user,
      isAuthLoading: authState.status === 'loading',
      retryAuthProfile,
    }),
    [authState, retryAuthProfile, user],
  );

  return (
    <AppContext.Provider value={contextValue}>{children}</AppContext.Provider>
  );
};
