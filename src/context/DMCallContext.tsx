'use client';

import {
  createContext,
  useContext,
  useState,
  useEffect,
  ReactNode,
  useCallback,
  useRef,
} from 'react';
import { useUser, useFirestore, startCall as fbStartCall, answerCall as fbAnswerCall, declineCall as fbDeclineCall, cancelCall as fbCancelCall, endCall as fbEndCall, getUserProfiles } from '@/firebase';
import type { MediaConnection } from 'peerjs';
import { collection, onSnapshot, query, where, Timestamp, doc } from 'firebase/firestore';
import type { DMCallWithProfiles, DMCall } from '@/firebase/calls/types';
import { useToast } from '@/hooks/use-toast';

// Dynamically import PeerJS only on the client
type Peer = import('peerjs').default;

interface DMCallContextType {
    currentCall: DMCallWithProfiles | null;
    localStream: MediaStream | null;
    remoteStream: MediaStream | null;
    isMuted: boolean;
    startCall: (receiverId: string) => Promise<void>;
    answerCall: () => Promise<void>;
    declineCall: () => Promise<void>;
    endCall: () => Promise<void>; // This can be used for cancelling too
    toggleMute: () => void;
}

const DMCallContext = createContext<DMCallContextType | undefined>(undefined);

// Helper function to get user profiles for a call
const fetchCallProfiles = async (firestore: any, call: DMCall): Promise<Omit<DMCallWithProfiles, keyof DMCall>> => {
    const profiles = await getUserProfiles(firestore, [call.callerId, call.receiverId]);
    return {
        callerProfile: profiles[call.callerId],
        receiverProfile: profiles[call.receiverId],
    };
};

export function DMCallProvider({ children }: { children: ReactNode }) {
    const { user } = useUser();
    const firestore = useFirestore();
    const { toast } = useToast();

    const [currentCall, setCurrentCall] = useState<DMCallWithProfiles | null>(null);
    const [localStream, setLocalStream] = useState<MediaStream | null>(null);
    const [remoteStream, setRemoteStream] = useState<MediaStream | null>(null);
    const [isMuted, setIsMuted] = useState(false);
    
    const peerRef = useRef<Peer | null>(null);
    const currentCallRef = useRef(currentCall); // Ref to avoid stale state in callbacks
    const mediaConnectionRef = useRef<MediaConnection | null>(null);
    const callTimeoutRef = useRef<NodeJS.Timeout | null>(null);
    const silentAudioRef = useRef<HTMLAudioElement>(null);

    useEffect(() => {
        currentCallRef.current = currentCall;
    }, [currentCall]);

    // This effect will try to keep the audio context alive on mobile
    useEffect(() => {
        if (currentCall?.status === 'connected') {
            // Play a silent audio track to keep the service worker alive on mobile
            silentAudioRef.current?.play().catch(() => {
                // Autoplay is often blocked, but we try anyway.
                // The user interacting with the call buttons should allow this to play.
            });
        } else {
            silentAudioRef.current?.pause();
        }
    }, [currentCall?.status]);

    const cleanupCall = useCallback(() => {
        if (callTimeoutRef.current) {
            clearTimeout(callTimeoutRef.current);
            callTimeoutRef.current = null;
        }
        localStream?.getTracks().forEach(track => track.stop());
        setLocalStream(null);
        setRemoteStream(null);
        setCurrentCall(null);
        mediaConnectionRef.current?.close();
        mediaConnectionRef.current = null;
    }, [localStream]);

    // Initialize PeerJS
    const initPeer = useCallback(async () => {
        if (!user) return;
        // Ensure existing peer is destroyed before creating a new one
        if (peerRef.current) {
            peerRef.current.destroy();
        }
        const { default: Peer } = await import('peerjs');
        const newPeer = new Peer(user.uid); // Use user UID for a stable Peer ID
        peerRef.current = newPeer;
        return newPeer;
    }, [user]);

    // Effect to listen for incoming calls
    useEffect(() => {
        if (!firestore || !user) return;

        const callsQuery = query(
            collection(firestore, 'dmCalls'),
            where('receiverId', '==', user.uid),
            where('status', '==', 'ringing')
        );
        
        const unsubscribe = onSnapshot(callsQuery, async (snapshot) => {
            if (!snapshot.empty) {
                const incomingCallDoc = snapshot.docs[0];
                const incomingCall = { id: incomingCallDoc.id, ...incomingCallDoc.data() } as DMCall;

                // Don't show a new call if we are already in one
                if (currentCallRef.current) return;
                
                const profiles = await fetchCallProfiles(firestore, incomingCall);
                setCurrentCall({ ...incomingCall, ...profiles });
            }
        });

        return () => unsubscribe();
    }, [firestore, user]);

    // Effect to listen for status changes on the current call
    useEffect(() => {
        if (!firestore || !currentCall?.id) return;
        const callDocRef = doc(firestore, 'dmCalls', currentCall.id);
        const unsubscribe = onSnapshot(callDocRef, (snapshot) => {
            const data = snapshot.data() as DMCall | undefined;
            if (!data) {
                cleanupCall();
                return;
            }

            const status = data.status;
            if (status === 'declined' || status === 'cancelled' || status === 'missed' || status === 'ended') {
                toast({ title: 'Call Ended' });
                cleanupCall();
            }
            if (status === 'connected' && currentCall.status === 'ringing') {
                setCurrentCall(prev => prev ? ({ ...prev, status: 'connected' }) : null);
            }
        });

        return () => unsubscribe();
    }, [firestore, currentCall?.id, currentCall?.status, cleanupCall, toast]);

    const startCall = useCallback(async (receiverId: string) => {
        if (!firestore || !user) return;
        if (currentCallRef.current) {
            toast({ variant: 'destructive', title: 'Already in a call' });
            return;
        }

        const peer = await initPeer();
        if (!peer) {
            toast({ variant: 'destructive', title: 'Connection Error', description: 'Could not initialize call service.' });
            return;
        }

        try {
            const stream = await navigator.mediaDevices.getUserMedia({ audio: true, video: false });
            setLocalStream(stream);

            const callDocRef = await fbStartCall(firestore, user.uid, peer.id, receiverId);
            const callDoc = { id: callDocRef.id, callerId: user.uid, receiverId, status: 'ringing', createdAt: Timestamp.now() } as DMCall;

            const profiles = await fetchCallProfiles(firestore, callDoc);
            setCurrentCall({ ...callDoc, ...profiles });

            peer.on('call', (call) => {
                mediaConnectionRef.current = call;
                call.answer(stream);
                call.on('stream', setRemoteStream);
                call.on('close', cleanupCall);
            });
            
            // Set 60-second timeout
            callTimeoutRef.current = setTimeout(async () => {
                if (currentCallRef.current?.status === 'ringing') {
                    await fbCancelCall(firestore, currentCallRef.current.id!);
                    toast({ title: "Call Unanswered", description: "The user didn't pick up." });
                    cleanupCall();
                }
            }, 60000);

        } catch (err) {
            console.error(err);
            toast({ variant: 'destructive', title: 'Microphone Error', description: 'Could not access your microphone.' });
        }
    }, [firestore, user, toast, initPeer, cleanupCall]);

    const answerCall = useCallback(async () => {
        if (!firestore || !user || !currentCall) return;
        
        const peer = await initPeer();
        if (!peer) {
             toast({ variant: 'destructive', title: 'Connection Error', description: 'Could not initialize call service.' });
            return;
        }
        
        try {
            const stream = await navigator.mediaDevices.getUserMedia({ audio: true, video: false });
            setLocalStream(stream);

            await fbAnswerCall(firestore, currentCall.id!, peer.id);
            const call = peer.call(currentCall.callerPeerId, stream);
            mediaConnectionRef.current = call;
            call.on('stream', setRemoteStream);
            call.on('close', cleanupCall);

        } catch (err) {
            console.error(err);
            toast({ variant: 'destructive', title: 'Microphone Error', description: 'Could not access your microphone.' });
        }
    }, [firestore, user, currentCall, toast, initPeer, cleanupCall]);

    const declineCall = useCallback(async () => {
        if (!firestore || !currentCall) return;
        await fbDeclineCall(firestore, currentCall.id!);
        cleanupCall();
    }, [firestore, currentCall, cleanupCall]);
    
    const endCall = useCallback(async () => {
        if (!firestore || !currentCall) return;
        if (currentCall.status === 'ringing' && user?.uid === currentCall.callerId) {
            await fbCancelCall(firestore, currentCall.id);
        } else {
            await fbEndCall(firestore, currentCall.id);
        }
        cleanupCall();
    }, [firestore, currentCall, user?.uid, cleanupCall]);
    
    const toggleMute = useCallback(() => {
        if (!localStream) return;
        const nextMuted = !isMuted;
        localStream.getAudioTracks().forEach(track => {
            track.enabled = !nextMuted;
        });
        setIsMuted(nextMuted);
    }, [isMuted, localStream]);
    
    const value = {
        currentCall,
        localStream,
        remoteStream,
        isMuted,
        startCall,
        answerCall,
        declineCall,
        endCall,
        toggleMute
    };

    return (
        <DMCallContext.Provider value={value}>
            {children}
            <audio ref={silentAudioRef} loop src="data:audio/wav;base64,UklGRigAAABXQVZFZm10IBIAAAABAAEARKwAAIhYAQACABAAAABkYXRhAgAAAAEA"></audio>
        </DMCallContext.Provider>
    );
}

export function useDMCall() {
  const context = useContext(DMCallContext);
  if (context === undefined) {
    throw new Error('useDMCall must be used within a DMCallProvider');
  }
  return context;
}

    