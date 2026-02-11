'use client';
import type { Timestamp } from 'firebase/firestore';
import type { UserProfile } from '../auth/users';

export interface FriendRequest {
  id?: string;
  fromUserId: string;
  toUserId: string;
  status: 'pending';
  createdAt: Timestamp;
}

export interface FriendRequestWithUserProfile extends FriendRequest {
  fromUserProfile: UserProfile;
}

export interface Friend {
  userId: string;
  createdAt: Timestamp;
}

export interface FriendWithProfile {
  id: string; // This is the friend's user ID
  userProfile: UserProfile;
  friendshipCreatedAt: Timestamp;
}

export interface BlockedUser {
    id?: string; // This is the blocked user's ID
    userId: string;
    createdAt: Timestamp;
}
