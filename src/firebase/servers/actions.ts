'use client';

import {
  type Firestore,
  collection,
  query,
  where,
  getDocs,
  addDoc,
  serverTimestamp,
  writeBatch,
  doc,
  getDoc,
  setDoc,
  deleteDoc,
  updateDoc,
} from 'firebase/firestore';
import type { User } from 'firebase/auth';
import { v4 as uuidv4 } from 'uuid';
import { PlaceHolderImages } from '@/lib/placeholder-images';
import type { ServerMessagePayload, Server, Channel, ServerRole } from './types';
import { errorEmitter } from '../error-emitter';
import { FirestorePermissionError } from '../errors';

export async function createServer(firestore: Firestore, user: User, serverName: string) {
    const defaultIcon = PlaceHolderImages.find(img => img.id === 'default-server-icon');

    const batch = writeBatch(firestore);

    // 1. Create the server document
    const newServerRef = doc(collection(firestore, 'servers'));
    const inviteCode = uuidv4().slice(0, 8);
    
    batch.set(newServerRef, {
        name: serverName,
        ownerId: user.uid,
        iconURL: defaultIcon?.imageUrl || '',
        createdAt: serverTimestamp(),
        inviteCode: inviteCode,
        trialModeEnabled: false,
    });
    
    // 2. Create the owner's member document
    const memberRef = doc(firestore, `servers/${newServerRef.id}/members/${user.uid}`);
    batch.set(memberRef, {
        role: 'owner',
        joinedAt: serverTimestamp(),
    });

    // 3. Create the default #guide channel
    const channelRef = doc(collection(firestore, `servers/${newServerRef.id}/channels`));
    batch.set(channelRef, {
        name: 'guide',
        type: 'text',
        serverId: newServerRef.id,
        userAccess: 'readwrite',
        topic: 'A place to get started in your new server.',
    });

    // 4. Create the welcome message in the #guide channel
    const messageRef = doc(collection(firestore, `servers/${newServerRef.id}/channels/${channelRef.id}/messages`));
    batch.set(messageRef, {
        authorId: 'flux-official',
        authorDisplayName: 'Flux Official',
        authorPhotoURL: '', // Can add an official logo URL here
        text: `# Welcome to ${serverName}!\n-# This is your brand new server. Here are a few tips to get you started:\n- You can invite friends using the server's invite code: **${inviteCode}**\n- Create new channels by clicking the '+' icon next to the channel headers.\n- Manage your server settings (soon!).`,
        createdAt: serverTimestamp(),
        channelId: channelRef.id,
    });

    await batch.commit();
    return newServerRef.id;
}


export async function joinServer(firestore: Firestore, user: User, inviteCode: string) {
    // 1. Find server by invite code
    const serversRef = collection(firestore, 'servers');
    const q = query(serversRef, where('inviteCode', '==', inviteCode));
    const querySnapshot = await getDocs(q);

    if (querySnapshot.empty) {
        throw new Error("Invalid invite code. No server found.");
    }
    const serverDoc = querySnapshot.docs[0];
    const serverId = serverDoc.id;
    const serverData = serverDoc.data() as Server;

    // 2. Check if user is already a member
    const memberRef = doc(firestore, `servers/${serverId}/members/${user.uid}`);
    const memberDoc = await getDoc(memberRef);
    if (memberDoc.exists()) {
        throw new Error("You are already a member of this server.");
    }
    
    // 3. Add user as a member
    const newMemberRole = serverData.trialModeEnabled ? 'trial' : 'user';
    await setDoc(memberRef, {
        role: newMemberRole,
        joinedAt: serverTimestamp(),
    });

    return serverId;
}

export const sendServerMessage = (
  firestore: Firestore,
  serverId: string,
  channelId: string,
  messageData: ServerMessagePayload
) => {
  const messagesRef = collection(firestore, `servers/${serverId}/channels/${channelId}/messages`);

  const data = {
    ...messageData,
    channelId,
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

export const editServerMessage = (
    firestore: Firestore,
    serverId: string,
    channelId: string,
    messageId: string,
    newText: string
) => {
    const messageRef = doc(firestore, `servers/${serverId}/channels/${channelId}/messages/${messageId}`);
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

export const deleteServerMessage = (
    firestore: Firestore,
    serverId: string,
    channelId: string,
    messageId: string
) => {
    const messageRef = doc(firestore, `servers/${serverId}/channels/${channelId}/messages/${messageId}`);
    return deleteDoc(messageRef).catch(async (serverError) => {
        const permissionError = new FirestorePermissionError({
            path: messageRef.path,
            operation: 'delete',
        });
        errorEmitter.emit('permission-error', permissionError);
        throw serverError;
    });
};

export const togglePinServerMessage = (
    firestore: Firestore,
    serverId: string,
    channelId: string,
    messageId: string,
    currentPinStatus: boolean | undefined
) => {
    const messageRef = doc(firestore, `servers/${serverId}/channels/${channelId}/messages/${messageId}`);
    const data = { pinned: !currentPinStatus };
    return updateDoc(messageRef, data).catch(async (serverError) => {
        const permissionError = new FirestorePermissionError({
            path: messageRef.path,
            operation: 'update',
            requestResourceData: data,
        });
        errorEmitter.emit('permission-error', permissionError);
        throw serverError;
    });
}

export const createChannel = (
    firestore: Firestore,
    serverId: string,
    channelData: Pick<Channel, 'name' | 'type' | 'userAccess'>
) => {
    const channelsRef = collection(firestore, `servers/${serverId}/channels`);
    const data = {
        ...channelData,
        serverId,
        topic: ''
    };

    return addDoc(channelsRef, data).catch(async (serverError) => {
        const permissionError = new FirestorePermissionError({
            path: channelsRef.path,
            operation: 'create',
            requestResourceData: data,
        });
        errorEmitter.emit('permission-error', permissionError);
        throw serverError;
    });
};

export const updateChannel = (
    firestore: Firestore,
    serverId: string,
    channelId: string,
    channelData: Partial<Pick<Channel, 'name' | 'topic' | 'userAccess'>>
) => {
    const channelRef = doc(firestore, `servers/${serverId}/channels/${channelId}`);
    
    return updateDoc(channelRef, channelData).catch(async (serverError) => {
        const permissionError = new FirestorePermissionError({
            path: channelRef.path,
            operation: 'update',
            requestResourceData: channelData,
        });
        errorEmitter.emit('permission-error', permissionError);
        throw serverError;
    });
}

export async function leaveServer(firestore: Firestore, serverId: string, userId: string) {
    const memberRef = doc(firestore, `servers/${serverId}/members/${userId}`);
    // You might want to add checks here, e.g., an owner can't leave unless they transfer ownership.
    // For now, we'll allow any member to leave.
    return deleteDoc(memberRef).catch(async (serverError) => {
        const permissionError = new FirestorePermissionError({
            path: memberRef.path,
            operation: 'delete',
        });
        errorEmitter.emit('permission-error', permissionError);
        throw serverError;
    });
}

export const updateUserRole = (
    firestore: Firestore,
    serverId: string,
    userId: string,
    newRole: ServerRole
) => {
    const memberRef = doc(firestore, `servers/${serverId}/members/${userId}`);
    const data = { role: newRole };
    return updateDoc(memberRef, data).catch(async (serverError) => {
        const permissionError = new FirestorePermissionError({
            path: memberRef.path,
            operation: 'update',
            requestResourceData: data,
        });
        errorEmitter.emit('permission-error', permissionError);
        throw serverError;
    });
};

export async function kickServerMember(firestore: Firestore, serverId: string, userId: string) {
    const memberRef = doc(firestore, `servers/${serverId}/members/${userId}`);
    return deleteDoc(memberRef).catch(async (serverError) => {
        const permissionError = new FirestorePermissionError({
            path: memberRef.path,
            operation: 'delete',
        });
        errorEmitter.emit('permission-error', permissionError);
        throw serverError;
    });
}
