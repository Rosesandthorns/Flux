'use client';
import type { Timestamp } from 'firebase/firestore';
import type { UserProfile } from '../auth/users';

export type DMCallStatus = 'ringing' | 'connected' | 'ended' | 'declined' | 'missed' | 'cancelled';

export interface DMCall {
  id?: string;
  callerId: string;
  callerPeerId: string;
  receiverId: string;
  receiverPeerId?: string;
  status: DMCallStatus;
  createdAt: Timestamp;
  endedAt?: Timestamp;
}

export interface DMCallWithProfiles extends DMCall {
    callerProfile: UserProfile;
    receiverProfile: UserProfile;
}

    