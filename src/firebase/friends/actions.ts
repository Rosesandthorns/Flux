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
  deleteDoc,
  getDoc,
} from 'firebase/firestore';

// Function to find user by handle
async function findUserByHandle(firestore: Firestore, handle: string) {
  const usersRef = collection(firestore, 'users');
  const q = query(usersRef, where('handle', '==', handle));
  const querySnapshot = await getDocs(q);
  if (querySnapshot.empty) {
    return null;
  }
  const userDoc = querySnapshot.docs[0];
  return { id: userDoc.id, ...userDoc.data() };
}

// Function to send a friend request
export async function sendFriendRequest(firestore: Firestore, fromUserId: string, toUserHandle: string) {
  if (!toUserHandle.includes('@flux')) {
    throw new Error('Invalid handle format. Must be username@flux');
  }

  const toUser = await findUserByHandle(firestore, toUserHandle);

  if (!toUser) {
    throw new Error('User not found.');
  }

  if (toUser.id === fromUserId) {
    throw new Error("You can't add yourself as a friend.");
  }
  
  // Check if they are already friends
  const friendDocRef = doc(firestore, `users/${fromUserId}/friends/${toUser.id}`);
  const friendDoc = await getDoc(friendDocRef);
  if (friendDoc.exists()) {
      throw new Error("You are already friends with this user.");
  }

  // Check for existing pending request (either way)
  const requestsRef = collection(firestore, 'friendRequests');
  const q1 = query(requestsRef, where('fromUserId', '==', fromUserId), where('toUserId', '==', toUser.id), where('status', '==', 'pending'));
  const q2 = query(requestsRef, where('fromUserId', '==', toUser.id), where('toUserId', '==', fromUserId), where('status', '==', 'pending'));
  
  const [snapshot1, snapshot2] = await Promise.all([getDocs(q1), getDocs(q2)]);

  if (!snapshot1.empty || !snapshot2.empty) {
    throw new Error("A friend request is already pending between you and this user.");
  }

  const requestData = {
    fromUserId,
    toUserId: toUser.id,
    status: 'pending',
    createdAt: serverTimestamp(),
  };

  await addDoc(requestsRef, requestData);
}

// Function to accept a friend request
export async function acceptFriendRequest(firestore: Firestore, requestId: string, fromUserId: string, toUserId: string) {
    const batch = writeBatch(firestore);

    // 1. Add to recipient's friends subcollection
    const toFriendRef = doc(firestore, `users/${toUserId}/friends/${fromUserId}`);
    batch.set(toFriendRef, { userId: fromUserId, createdAt: serverTimestamp() });

    // 2. Add to sender's friends subcollection
    const fromFriendRef = doc(firestore, `users/${fromUserId}/friends/${toUserId}`);
    batch.set(fromFriendRef, { userId: toUserId, createdAt: serverTimestamp() });
    
    // 3. Delete the friend request
    const requestRef = doc(firestore, 'friendRequests', requestId);
    batch.delete(requestRef);

    await batch.commit();
}

// Function to decline or cancel a friend request
export async function declineOrCancelFriendRequest(firestore: Firestore, requestId: string) {
    const requestRef = doc(firestore, 'friendRequests', requestId);
    await deleteDoc(requestRef);
}
