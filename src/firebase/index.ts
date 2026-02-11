import { initializeApp, getApps, getApp, type FirebaseApp } from 'firebase/app';
import { getAuth, type Auth } from 'firebase/auth';
import { getFirestore, type Firestore } from 'firebase/firestore';
import { firebaseConfig } from './config';

import { FirebaseProvider, useFirebase, useFirebaseApp, useFirestore, useAuth } from './provider';
import FirebaseClientProvider from './client-provider';
import { useUser } from './auth/use-user';
import { useCollection } from './firestore/use-collection';
import { useDoc } from './firestore/use-doc';
import { useUserProfile } from './auth/use-user-profile';
import { updateUserSettings } from './auth/settings';
import { deleteUserDocument } from './auth/users';
import { sendFriendRequest, acceptFriendRequest, declineOrCancelFriendRequest } from './friends/actions';
import { useFriends, useFriendRequests } from './friends/hooks';
import { useMessages } from './messages/hooks';
import { sendMessage, editMessage, deleteMessage } from './messages/actions';
import type { Message } from './messages/types';
import { createServer, joinServer, sendServerMessage, createChannel, leaveServer, updateChannel, editServerMessage, deleteServerMessage, togglePinServerMessage, updateUserRole, kickServerMember, deleteChannel } from './servers/actions';
import { useUserServers, useServer, useServerChannels, useServerMessages, useServerMember, useChannelParticipants, useServerMembers } from './servers/hooks';

function initializeFirebase(): { app: FirebaseApp | null; auth: Auth | null; firestore: Firestore | null; } {
    if (typeof window === 'undefined') {
        return { app: null, auth: null, firestore: null };
    }

    if (getApps().length) {
        const app = getApp();
        return { app, auth: getAuth(app), firestore: getFirestore(app) };
    }
    
    const app = initializeApp(firebaseConfig);
    const auth = getAuth(app);
    const firestore = getFirestore(app);

    return { app, auth, firestore };
}

export {
  initializeFirebase,
  FirebaseProvider,
  FirebaseClientProvider,
  useFirebase,
  useFirebaseApp,
  useFirestore,
  useAuth,
  useUser,
  useCollection,
  useDoc,
  useUserProfile,
  updateUserSettings,
  sendFriendRequest,
  acceptFriendRequest,
  declineOrCancelFriendRequest,
  useFriends,
  useFriendRequests,
  useMessages,
  sendMessage,
  editMessage,
  deleteMessage,
  createServer,
  joinServer,
  useUserServers,
  useServer,
  useServerChannels,
  useServerMessages,
  sendServerMessage,
  useServerMember,
  useServerMembers,
  createChannel,
  leaveServer,
  updateChannel,
  editServerMessage,
  deleteServerMessage,
  togglePinServerMessage,
  useChannelParticipants,
  updateUserRole,
  deleteUserDocument,
  kickServerMember,
  deleteChannel,
};
export type { Message };
