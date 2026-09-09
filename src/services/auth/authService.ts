import {
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  signOut,
  updateProfile,
} from 'firebase/auth';

import { doc, setDoc, getDoc, serverTimestamp } from 'firebase/firestore';

import { auth, db } from '../../config/firebase';
import { COLLECTIONS } from '../firestore-structure';

import type {
  AuthResponseSuccess,
  SignInPayload,
  SignUpPayload,
  UserData,
} from '../../features/auth/types';

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

      await updateProfile(user, {
        displayName: role === 'COMPANY' ? companyName : name,
      });

      const userData: UserData = {
        uid: user.uid,
        email: user.email!,
        role,
        createdAt: serverTimestamp(),
      };

      if (role === 'COMPANY') {
        userData.companyName = companyName;
      } else if (role === 'DEVELOPER') {
        userData.name = name;
      }

      // Create user document in Firestore
      try {
        await setDoc(doc(db, COLLECTIONS.USERS, user.uid), userData);
      } catch (createError: any) {
        console.error('Error creating user document:', createError);
        throw new Error(
          'Account created but profile setup incomplete. Please sign in to complete setup.',
        );
      }

      return {
        ...userData,
        displayName: user.displayName,
      };
    } catch (error: any) {
      let errorMessage = error.message;

      // Handle specific Firebase auth errors
      if (error.code === 'auth/email-already-in-use') {
        errorMessage =
          'An account with this email already exists. Please try signing in instead.';
      } else if (error.code === 'auth/weak-password') {
        errorMessage =
          'Password is too weak. Please choose a stronger password.';
      } else if (error.code === 'auth/invalid-email') {
        errorMessage = 'Please enter a valid email address.';
      } else if (
        error.code === 'permission-denied' ||
        error.message?.includes('permission')
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

      const userDoc = await getDoc(doc(db, COLLECTIONS.USERS, user.uid));

      if (!userDoc.exists()) {
        const basicUserData: UserData = {
          uid: user.uid,
          email: user.email!,
          role: 'DEVELOPER',
          name: user.displayName || 'User',
          createdAt: serverTimestamp(),
        };

        try {
          await setDoc(doc(db, COLLECTIONS.USERS, user.uid), basicUserData);

          return {
            ...basicUserData,
            displayName: user.displayName,
          };
        } catch (createError: any) {
          throw new Error(
            'Failed to create user profile. Please try signing up again.',
          );
        }
      }

      const userData = userDoc.data() as UserData;

      return {
        ...userData,
        uid: user.uid,
        email: user.email!,
        displayName: user.displayName,
      };
    } catch (error: any) {
      let errorMessage = error.message;
      if (error.code === 'auth/user-not-found') {
        errorMessage =
          'No account found with this email. Please sign up first.';
      } else if (error.code === 'auth/wrong-password') {
        errorMessage = 'Incorrect password. Please try again.';
      } else if (error.code === 'auth/invalid-credential') {
        errorMessage = 'Invalid credentials';
      } else if (error.code === 'auth/too-many-requests') {
        errorMessage = 'Too many failed attempts. Please try again later.';
      }

      throw new Error(errorMessage);
    }
  }

  async signOut(): Promise<void> {
    try {
      await signOut(auth);
    } catch (error: any) {
      throw new Error(error.message);
    }
  }
}

export const authService = new AuthService();
