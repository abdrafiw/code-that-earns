import type { FieldValue, Timestamp } from 'firebase/firestore';
import type {
  UserDocument,
  UserRole,
} from '../../services/firestore-structure';

export type { UserRole } from '../../services/firestore-structure';

export interface SignUpPayload {
  email: string;
  role: UserRole;
  password: string;
  name?: string;
  companyName?: string;
}

export interface SignInPayload {
  email: string;
  password: string;
}

export interface UserStats {
  challengesPosted?: number;
  challengesWon?: number;
  totalEarned?: number;
  totalSpent?: number;
}

export type UserData = Omit<UserDocument, 'createdAt' | 'updatedAt'> & {
  createdAt?: Timestamp | FieldValue;
  updatedAt?: Timestamp | FieldValue;
};

export interface AuthResponseSuccess {
  success: true;
  user: UserData & {
    displayName?: string | null;
  };
}

export interface AuthResponseError {
  success: false;
  error: string;
}

export type AuthResponse = AuthResponseSuccess | AuthResponseError;
