'use client';
import { useState, useEffect, useMemo } from 'react';
import { useFirestore } from '../provider';
import type { UserProfile } from './users';
import { getUserProfiles } from './users';

export function useAuthorProfiles(authorIds: string[]) {
    const firestore = useFirestore();
    const [profiles, setProfiles] = useState<Record<string, UserProfile>>({});
    const [loading, setLoading] = useState(true);

    const uniqueIdsKey = useMemo(() => {
        const uniqueIds = [...new Set(authorIds.filter(id => id))];
        uniqueIds.sort();
        return JSON.stringify(uniqueIds);
    }, [authorIds]);

    useEffect(() => {
        const uniqueIds = JSON.parse(uniqueIdsKey);
        if (!firestore || uniqueIds.length === 0) {
            setProfiles({});
            setLoading(false);
            return;
        }

        setLoading(true);

        getUserProfiles(firestore, uniqueIds)
            .then(fetchedProfiles => {
                setProfiles(fetchedProfiles);
                setLoading(false);
            })
            .catch(error => {
                console.error("Error fetching author profiles:", error);
                setLoading(false);
            });

    }, [firestore, uniqueIdsKey]);

    return { profiles, loading };
}
