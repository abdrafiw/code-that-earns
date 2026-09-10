import {
  afterEach,
  beforeEach,
  describe,
  expect,
  it,
  jest,
} from '@jest/globals';
import {
  createUserWithEmailAndPassword,
  deleteUser,
  updateProfile,
  type User,
  type UserCredential,
} from 'firebase/auth';
import { setDoc } from 'firebase/firestore';

import { authService } from './authService';

jest.mock('firebase/auth', () => ({
  createUserWithEmailAndPassword: jest.fn(),
  deleteUser: jest.fn(),
  signInWithEmailAndPassword: jest.fn(),
  signOut: jest.fn(),
  updateProfile: jest.fn(),
}));

jest.mock('firebase/firestore', () => ({
  doc: jest.fn(() => ({ path: 'users/user-1' })),
  getDoc: jest.fn(),
  serverTimestamp: jest.fn(() => ({ _methodName: 'serverTimestamp' })),
  setDoc: jest.fn(),
}));

jest.mock('../../config/firebase', () => ({
  auth: {},
  db: {},
}));

const firebaseUser = {
  uid: 'user-1',
  email: 'developer@example.com',
  displayName: 'Developer',
} as User;

const signupPayload = {
  email: 'developer@example.com',
  password: 'strong-password',
  name: 'Developer',
  role: 'DEVELOPER' as const,
};

describe('AuthService signup rollback', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    jest.spyOn(console, 'error').mockImplementation(() => undefined);
    jest.mocked(createUserWithEmailAndPassword).mockResolvedValue({
      user: firebaseUser,
    } as UserCredential);
    jest.mocked(updateProfile).mockResolvedValue(undefined);
    jest.mocked(deleteUser).mockResolvedValue(undefined);
  });

  afterEach(() => {
    jest.restoreAllMocks();
  });

  it('deletes the newly created Auth user when profile creation fails', async () => {
    jest.mocked(setDoc).mockRejectedValue(new Error('Firestore unavailable'));

    await expect(authService.signUp(signupPayload)).rejects.toThrow(
      'No account was kept',
    );
    expect(deleteUser).toHaveBeenCalledWith(firebaseUser);
  });

  it('reports recovery guidance when automatic cleanup also fails', async () => {
    jest.mocked(setDoc).mockRejectedValue(new Error('Firestore unavailable'));
    jest.mocked(deleteUser).mockRejectedValue(new Error('Network unavailable'));

    await expect(authService.signUp(signupPayload)).rejects.toThrow(
      'automatic cleanup could not be confirmed',
    );
    expect(deleteUser).toHaveBeenCalledWith(firebaseUser);
  });
});
