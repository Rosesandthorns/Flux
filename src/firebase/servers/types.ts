'use client';
import type { Timestamp } from 'firebase/firestore';

export interface Server {
    id?: string;
    name: string;
    ownerId: string;
    iconURL: string;
    inviteCode: string;
    createdAt: Timestamp;
    trialModeEnabled?: boolean;
}

export type ServerRole = 'owner' | 'admin' | 'user' | 'trial';

export interface ServerMember {
    id?: string; // userId
    role: ServerRole;
    joinedAt: Timestamp;
}

export interface Channel {
    id?: string;
    name: string;
    type: 'text' | 'voice';
    topic?: string;
    serverId: string;
    userAccess: 'readwrite' | 'readonly' | 'none';
}

export interface ServerMessage {
  id?: string;
  authorId: string;
  authorDisplayName: string;
  authorPhotoURL: string;
  text: string;
  createdAt: Timestamp | null;
  editedAt?: Timestamp | null;
  pinned?: boolean;
  channelId: string;
}

export type ServerMessagePayload = Omit<ServerMessage, 'id' | 'createdAt' | 'channelId' | 'editedAt' | 'pinned'>;

export interface VoiceParticipant {
  userId: string;
  peerId: string;
  displayName: string;
  photoURL: string;
}
