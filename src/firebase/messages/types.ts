'use client';
import type { Timestamp } from 'firebase/firestore';

export interface Message {
  id?: string;
  authorId: string;
  text: string;
  createdAt: Timestamp | null;
  editedAt?: Timestamp | null;
  conversationId: string;
}
