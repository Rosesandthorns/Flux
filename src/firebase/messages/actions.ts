'use client';
import {
  type Firestore,
  collection,
  addDoc,
  serverTimestamp,
} from 'firebase/firestore';
import { errorEmitter } from '@/firebase/error-emitter';
import { FirestorePermissionError } from '@/firebase/errors';
import type { Message } from './types';

type MessagePayload = Omit<Message, 'id' | 'createdAt'>;

export const sendMessage = (
  firestore: Firestore,
  conversationId: string,
  messageData: Omit<MessagePayload, 'conversationId'>
) => {
  const messagesRef = collection(firestore, `dms/${conversationId}/messages`);

  const data = {
    ...messageData,
    conversationId,
    createdAt: serverTimestamp(),
  };

  return addDoc(messagesRef, data).catch(async (serverError) => {
    const permissionError = new FirestorePermissionError({
      path: messagesRef.path,
      operation: 'create',
      requestResourceData: data,
    });
    errorEmitter.emit('permission-error', permissionError);
    throw serverError;
  });
};
