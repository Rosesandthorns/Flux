'use client';
import type { Timestamp } from 'firebase/firestore';

export interface Server {
    id?: string;
    name: string;
    ownerId: string;
    iconURL: string;
    inviteCode: string;
    createdAt: Timestamp;
}

export type ServerRole = 'owner' | 'admin' | 'user';

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
}

export interface ServerMessage {
  id?: string;
  authorId: string;
  authorDisplayName: string;
  authorPhotoURL: string;
  text: string;
  createdAt: Timestamp | null;
  channelId: string;
}

export type ServerMessagePayload = Omit<ServerMessage, 'id' | 'createdAt' | 'channelId'>;

