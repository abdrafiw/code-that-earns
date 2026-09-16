import {
  createUserWithEmailAndPassword,
  deleteUser,
  signInWithEmailAndPassword,
  signOut,
  updateProfile,
} from 'firebase/auth';

import { doc, setDoc, getDoc, serverTimestamp } from 'firebase/firestore';

import { auth, db } from '../../config/firebase';
import { COLLECTIONS, userConverter } from '../firestore-structure';

import type {
  AuthResponseSuccess,
  SignInPayload,
  SignUpPayload,
  UserData,
} from '../../features/auth/types';
import { getErrorMessage } from '../../utils/getErrorMessage';

const getErrorCode = (error: unknown) =>
  typeof error === 'object' && error !== null && 'code' in error
    ? String(error.code)
    : '';

class AuthService {
  async signUp({
    email,
    password,
    name,
    companyName,
    role,
  }: SignUpPayload): Promise<AuthResponseSuccess['user']> {
    try {
      const userCredential = await createUserWithEmailAndPassword(
        auth,
        email,
        password,
      );
      const user = userCredential.user;

      try {
        await updateProfile(user, {
          displayName: role === 'ORGANIZATION' ? companyName : name,
        });

        const userData: UserData = {
          uid: user.uid,
          email: user.email!,
          role,
          createdAt: serverTimestamp(),
        };

        if (role === 'ORGANIZATION') {
          userData.companyName = companyName;
        } else if (role === 'DEVELOPER') {
          userData.name = name;
        }

        await setDoc(doc(db, COLLECTIONS.USERS, user.uid), userData);

        return {
          ...userData,
          displayName: user.displayName,
        };
      } catch {
        try {
          await deleteUser(user);
        } catch {
          throw new Error(
            'Account setup failed and automatic cleanup could not be confirmed. Try signing in to recover the profile, or contact support.',
          );
        }

        throw new Error(
          'Account setup failed. No account was kept, so you can safely try signing up again.',
        );
      }
    } catch (error: unknown) {
      const errorCode = getErrorCode(error);
      let errorMessage = getErrorMessage(error);

      // Handle specific Firebase auth errors
      if (errorCode === 'auth/email-already-in-use') {
        errorMessage =
          'An account with this email already exists. Please try signing in instead.';
      } else if (errorCode === 'auth/weak-password') {
        errorMessage =
          'Password is too weak. Please choose a stronger password.';
      } else if (errorCode === 'auth/invalid-email') {
        errorMessage = 'Please enter a valid email address.';
      } else if (
        errorCode === 'permission-denied' ||
        errorMessage.toLowerCase().includes('permission')
      ) {
        errorMessage =
          'Permission denied. Please check your Firestore security rules.';
      }

      throw new Error(errorMessage);
    }
  }

  async signIn({
    email,
    password,
  }: SignInPayload): Promise<AuthResponseSuccess['user']> {
    try {
      const userCredential = await signInWithEmailAndPassword(
        auth,
        email,
        password,
      );
      const user = userCredential.user;

      const userDoc = await getDoc(
        doc(db, COLLECTIONS.USERS, user.uid).withConverter(userConverter),
      );

      if (!userDoc.exists()) {
        await signOut(auth);
        throw new Error(
          'Your account profile is missing. Contact support to recover your account before signing in.',
        );
      }

      const userData = userDoc.data();

      return {
        ...userData,
        uid: user.uid,
        email: user.email!,
        displayName: user.displayName,
      };
    } catch (error: unknown) {
      const errorCode = getErrorCode(error);
      let errorMessage = getErrorMessage(error);
      if (errorCode === 'auth/user-not-found') {
        errorMessage =
          'No account found with this email. Please sign up first.';
      } else if (errorCode === 'auth/wrong-password') {
        errorMessage = 'Incorrect password. Please try again.';
      } else if (errorCode === 'auth/invalid-credential') {
        errorMessage = 'Invalid credentials';
      } else if (errorCode === 'auth/too-many-requests') {
        errorMessage = 'Too many failed attempts. Please try again later.';
      }

      throw new Error(errorMessage);
    }
  }

  async signOut(): Promise<void> {
    try {
      await signOut(auth);
    } catch (error: unknown) {
      throw new Error(getErrorMessage(error));
    }
  }
}

export const authService = new AuthService();
