'use client';
import {
  type Firestore,
  collection,
  addDoc,
  serverTimestamp,
  doc,
  updateDoc,
  deleteDoc,
} from 'firebase/firestore';
import { errorEmitter } from '@/firebase/error-emitter';
import { FirestorePermissionError } from '@/firebase/errors';
import type { Message } from './types';

type MessagePayload = Omit<Message, 'id' | 'createdAt' | 'editedAt' | 'conversationId'>;

export const sendMessage = (
  firestore: Firestore,
  conversationId: string,
  messageData: MessagePayload
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

export const editMessage = (
  firestore: Firestore,
  conversationId: string,
  messageId: string,
  newText: string
) => {
    const messageRef = doc(firestore, `dms/${conversationId}/messages/${messageId}`);
    const data = {
        text: newText,
        editedAt: serverTimestamp()
    };
    return updateDoc(messageRef, data).catch(async (serverError) => {
        const permissionError = new FirestorePermissionError({
            path: messageRef.path,
            operation: 'update',
            requestResourceData: data,
        });
        errorEmitter.emit('permission-error', permissionError);
        throw serverError;
    });
};

export const deleteMessage = (
  firestore: Firestore,
  conversationId: string,
  messageId: string
) => {
    const messageRef = doc(firestore, `dms/${conversationId}/messages/${messageId}`);
    return deleteDoc(messageRef).catch(async (serverError) => {
        const permissionError = new FirestorePermissionError({
            path: messageRef.path,
            operation: 'delete',
        });
        errorEmitter.emit('permission-error', permissionError);
        throw serverError;
    });
};
