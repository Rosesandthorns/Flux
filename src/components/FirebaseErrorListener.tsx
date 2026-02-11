"use client";

import { useEffect } from 'react';
import { errorEmitter } from '@/firebase/error-emitter';
import { useToast } from '@/hooks/use-toast';
import { FirestorePermissionError } from '@/firebase/errors';

export default function FirebaseErrorListener() {
    const { toast } = useToast();
    useEffect(() => {
        const handleError = (error: Error) => {
            if (process.env.NODE_ENV === 'development' && error instanceof FirestorePermissionError) {
                // In dev, throw to trigger the Next.js error overlay for better debugging
                throw error;
            } else {
                // In prod, show a toast
                toast({
                    variant: 'destructive',
                    title: 'Permission Denied',
                    description: 'You do not have permission to perform this action.',
                });
            }
        };

        errorEmitter.on('permission-error', handleError);
        
        return () => {};
    }, [toast]);

    return null;
}
