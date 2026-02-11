'use client';

import {
  type Firestore,
  collection,
  addDoc,
  serverTimestamp,
  doc,
  updateDoc,
} from 'firebase/firestore';
import { errorEmitter } from '@/firebase/error-emitter';
import { FirestorePermissionError } from '@/firebase/errors';

export const startCall = (
  firestore: Firestore,
  callerId: string,
  callerPeerId: string,
  receiverId: string
) => {
  const callsRef = collection(firestore, 'dmCalls');
  const callData = {
    callerId,
    callerPeerId,
    receiverId,
    status: 'ringing',
    createdAt: serverTimestamp(),
  };
  
  // Return promise which resolves with the new document reference
  return addDoc(callsRef, callData).catch(async (serverError) => {
    const permissionError = new FirestorePermissionError({
        path: callsRef.path,
        operation: 'create',
        requestResourceData: callData,
    });
    errorEmitter.emit('permission-error', permissionError);
    throw serverError;
  });
};

export const answerCall = async (
  firestore: Firestore,
  callId: string,
  receiverPeerId: string
) => {
  const callRef = doc(firestore, 'dmCalls', callId);
  await updateDoc(callRef, {
    status: 'connected',
    receiverPeerId: receiverPeerId,
  });
};

export const declineCall = async (firestore: Firestore, callId: string) => {
  const callRef = doc(firestore, 'dmCalls', callId);
  await updateDoc(callRef, {
    status: 'declined',
    endedAt: serverTimestamp(),
  });
};

export const cancelCall = async (firestore: Firestore, callId: string) => {
    const callRef = doc(firestore, 'dmCalls', callId);
    await updateDoc(callRef, {
        status: 'cancelled',
        endedAt: serverTimestamp(),
    });
};

export const endCall = async (firestore: Firestore, callId: string) => {
  const callRef = doc(firestore, 'dmCalls', callId);
  await updateDoc(callRef, {
    status: 'ended',
    endedAt: serverTimestamp(),
  });
};

    