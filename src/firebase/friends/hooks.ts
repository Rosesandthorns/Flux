'use client';

import { useState, useEffect, useMemo } from 'react';
import { useUser } from '../auth/use-user';
import { useFirestore } from '../provider';
import { collection, query, where, onSnapshot, doc, getDoc } from 'firebase/firestore';
import type { Friend, FriendRequest, FriendRequestWithUserProfile, FriendWithProfile } from './types';
import type { UserProfile } from '../auth/users';
import { useCollection } from '../firestore/use-collection';

// Hook to get incoming friend requests
export function useFriendRequests() {
    const { user } = useUser();
    const firestore = useFirestore();
    const [requests, setRequests] = useState<FriendRequestWithUserProfile[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        if (!user || !firestore) {
            setLoading(false);
            setRequests([]);
            return;
        };

        const requestsQuery = query(
            collection(firestore, 'friendRequests'),
            where('toUserId', '==', user.uid),
            where('status', '==', 'pending')
        );

        const unsubscribe = onSnapshot(requestsQuery, async (snapshot) => {
            if (snapshot.empty) {
                setRequests([]);
                setLoading(false);
                return;
            }

            const newRequests: FriendRequest[] = snapshot.docs.map(d => ({ id: d.id, ...d.data() } as FriendRequest));
            
            const requestsWithProfiles = await Promise.all(
                newRequests.map(async (req) => {
                    if (!firestore) return null;
                    const userProfileRef = doc(firestore, 'users', req.fromUserId);
                    const userProfileSnap = await getDoc(userProfileRef);
                    if (!userProfileSnap.exists()) return null;
                    const fromUserProfile = {id: userProfileSnap.id, ...userProfileSnap.data()} as UserProfile;
                    return { ...req, fromUserProfile };
                })
            );
            
            setRequests(requestsWithProfiles.filter(Boolean) as FriendRequestWithUserProfile[]);
            setLoading(false);
        }, (error) => {
            console.error("Error fetching friend requests:", error);
            setLoading(false);
        });

        return () => unsubscribe();
    }, [user, firestore]);

    return { data: requests, loading };
}

// Hook to get friends
export function useFriends() {
    const { user } = useUser();
    const firestore = useFirestore();

    const friendsQuery = useMemo(() => {
        if (!user || !firestore) return null;
        return collection(firestore, `users/${user.uid}/friends`);
    }, [user, firestore]);

    const { data: friendsData, loading: friendsLoading, error } = useCollection<Friend>(friendsQuery);

    const [friendsWithProfiles, setFriendsWithProfiles] = useState<FriendWithProfile[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        if (friendsLoading) {
            setLoading(true);
            return;
        }
        if (!friendsData || !firestore || error) {
            setFriendsWithProfiles([]);
            setLoading(false);
            return;
        };
        
        const fetchProfiles = async () => {
            setLoading(true);
            const profiles = await Promise.all(
                friendsData.map(async (friend) => {
                    const userProfileRef = doc(firestore, 'users', friend.userId);
                    const userProfileSnap = await getDoc(userProfileRef);
                    if (!userProfileSnap.exists()) return null;
                    return {
                        id: friend.userId,
                        userProfile: { id: userProfileSnap.id, ...userProfileSnap.data() } as UserProfile,
                        friendshipCreatedAt: friend.createdAt,
                    };
                })
            );
            setFriendsWithProfiles(profiles.filter(Boolean) as FriendWithProfile[]);
            setLoading(false);
        };

        if (friendsData.length > 0) {
            fetchProfiles();
        } else {
            setFriendsWithProfiles([]);
            setLoading(false);
        }
    }, [friendsData, firestore, friendsLoading, error]);
    
    return { data: friendsWithProfiles, loading };
}
