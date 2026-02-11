'use client';

import {
  createContext,
  useContext,
  useState,
  useEffect,
  ReactNode,
  useCallback,
  useRef,
  useMemo,
} from 'react';
import { useUser, useUserProfile, useFirestore } from '@/firebase';
import { useToast } from '@/hooks/use-toast';
import type { MediaConnection } from 'peerjs';
import {
  collection,
  deleteDoc,
  doc,
  onSnapshot,
  setDoc,
  type Unsubscribe,
} from 'firebase/firestore';
import type { VoiceParticipant } from '@/firebase/servers/types';

// Dynamically import PeerJS only on the client
type Peer = import('peerjs').default;

interface DisplayParticipant extends VoiceParticipant {
  stream?: MediaStream;
}

interface VoiceContextType {
  activeVoiceChannel: {
    serverId: string;
    channelId: string;
    channelName: string;
  } | null;
  participants: DisplayParticipant[];
  isMuted: boolean;
  isDeafened: boolean;
  joinChannel: (
    serverId: string,
    channelId: string,
    channelName: string
  ) => void;
  leaveChannel: () => void;
  toggleMute: () => void;
  toggleDeafen: () => void;
}

const VoiceContext = createContext<VoiceContextType | undefined>(undefined);

const AudioPlayer = ({ stream }: { stream: MediaStream }) => {
  const audioRef = useRef<HTMLAudioElement>(null);
  useEffect(() => {
    if (audioRef.current) {
      audioRef.current.srcObject = stream;
    }
  }, [stream]);
  return <audio ref={audioRef} autoPlay />;
};

export function VoiceProvider({ children }: { children: ReactNode }) {
  const [
    activeVoiceChannel,
    setActiveVoiceChannel,
  ] = useState<{ serverId: string; channelId: string; channelName: string } | null>(
    null
  );
  const [firestoreParticipants, setFirestoreParticipants] = useState<
    VoiceParticipant[]
  >([]);
  const [remoteStreams, setRemoteStreams] = useState<
    Record<string, MediaStream>
  >({});
  const [isMuted, setIsMuted] = useState(false);
  const [isDeafened, setIsDeafened] = useState(false);
  const [muteStateBeforeDeafen, setMuteStateBeforeDeafen] = useState(false);

  const { user } = useUser();
  const { data: userProfile } = useUserProfile();
  const firestore = useFirestore();
  const { toast } = useToast();

  const peerRef = useRef<Peer | null>(null);
  const localStreamRef = useRef<MediaStream | null>(null);
  const connectionsRef = useRef<Record<string, MediaConnection>>({});
  const fsUnsubscribeRef = useRef<Unsubscribe | null>(null);

  const participants = useMemo(() => {
    return firestoreParticipants.map((p) => ({
      ...p,
      stream: remoteStreams[p.peerId],
    }));
  }, [firestoreParticipants, remoteStreams]);
  
  const cleanupResources = useCallback(() => {
    fsUnsubscribeRef.current?.();
    fsUnsubscribeRef.current = null;

    Object.values(connectionsRef.current).forEach((conn) => conn.close());
    connectionsRef.current = {};

    localStreamRef.current?.getTracks().forEach((track) => track.stop());
    localStreamRef.current = null;

    peerRef.current?.destroy();
    peerRef.current = null;

    if (firestore && user && activeVoiceChannel) {
      const participantRef = doc(
        firestore,
        'servers',
        activeVoiceChannel.serverId,
        'channels',
        activeVoiceChannel.channelId,
        'participants',
        user.uid
      );
      deleteDoc(participantRef).catch(console.error);
    }
  }, [firestore, user, activeVoiceChannel]);
  
  const resetState = useCallback(() => {
    setActiveVoiceChannel(null);
    setFirestoreParticipants([]);
    setRemoteStreams({});
    setIsMuted(false);
    setIsDeafened(false);
  }, []);
  
  const cleanup = useCallback(() => {
    cleanupResources();
    resetState();
  }, [cleanupResources, resetState]);

  // This ref pattern is crucial to prevent the useEffect below from re-running on every render,
  // which was the cause of the join/leave bug.
  const cleanupRef = useRef(cleanup);
  useEffect(() => {
    cleanupRef.current = cleanup;
  });

  useEffect(() => {
    // This effect now only triggers its cleanup when the component unmounts or the user logs out.
    // It will not trigger on channel changes.
    const handleCleanup = () => cleanupRef.current();

    // Add a beforeunload listener to clean up if the user closes the tab
    window.addEventListener('beforeunload', handleCleanup);

    return () => {
      handleCleanup();
      window.removeEventListener('beforeunload', handleCleanup);
    };
  }, [user]); // The effect's behavior is tied to the user's session and component lifecycle.

  const leaveChannel = useCallback(() => {
    cleanup();
  }, [cleanup]);

  const joinChannel = useCallback(
    async (serverId: string, channelId: string, channelName: string) => {
      if (activeVoiceChannel?.channelId === channelId) return;
      if (!firestore || !user || !userProfile) return;

      // Clean up resources from the PREVIOUS channel, but don't reset UI state yet.
      cleanupResources();

      try {
        const stream = await navigator.mediaDevices.getUserMedia({
          audio: true,
          video: false,
        });
        localStreamRef.current = stream;

        // Immediately update the UI to show the user is in the new channel
        setActiveVoiceChannel({ serverId, channelId, channelName });

        const { default: Peer } = await import('peerjs');
        const newPeer = new Peer();
        peerRef.current = newPeer;

        newPeer.on('open', (peerId) => {
          const participantRef = doc(
            firestore,
            'servers',
            serverId,
            'channels',
            channelId,
            'participants',
            user.uid
          );
          setDoc(participantRef, {
            userId: user.uid,
            peerId: peerId,
            displayName: userProfile.displayName,
            photoURL: userProfile.photoURL || '',
          });

          const participantsCol = collection(
            firestore,
            'servers',
            serverId,
            'channels',
            channelId,
            'participants'
          );
          fsUnsubscribeRef.current = onSnapshot(
            participantsCol,
            (snapshot) => {
              const currentParticipants = snapshot.docs.map(
                (d) => d.data() as VoiceParticipant
              );
              setFirestoreParticipants(currentParticipants);

              // Connect to new participants
              currentParticipants.forEach((p) => {
                if (
                  p.peerId !== peerId &&
                  !connectionsRef.current[p.peerId] &&
                  localStreamRef.current
                ) {
                  const call = newPeer.call(p.peerId, localStreamRef.current);
                  if (call) {
                    connectionsRef.current[p.peerId] = call;
                    call.on('stream', (remoteStream) => {
                      setRemoteStreams((prev) => ({
                        ...prev,
                        [p.peerId]: remoteStream,
                      }));
                    });
                    call.on('close', () => {
                      delete connectionsRef.current[p.peerId];
                      setRemoteStreams((prev) => {
                        const next = { ...prev };
                        delete next[p.peerId];
                        return next;
                      });
                    });
                  }
                }
              });
              
              // Clean up connections to participants who have left
              const currentPeerIds = new Set(currentParticipants.map(p => p.peerId));
              Object.keys(connectionsRef.current).forEach(connPeerId => {
                if (!currentPeerIds.has(connPeerId)) {
                  connectionsRef.current[connPeerId]?.close();
                  delete connectionsRef.current[connPeerId];
                   setRemoteStreams((prev) => {
                        const next = { ...prev };
                        delete next[connPeerId];
                        return next;
                      });
                }
              });
            }
          );
        });

        newPeer.on('call', (call) => {
          if (localStreamRef.current) {
            call.answer(localStreamRef.current);
            connectionsRef.current[call.peer] = call;
            call.on('stream', (remoteStream) => {
              setRemoteStreams((prev) => ({
                ...prev,
                [call.peer]: remoteStream,
              }));
            });
            call.on('close', () => {
              delete connectionsRef.current[call.peer];
              setRemoteStreams((prev) => {
                const next = { ...prev };
                delete next[call.peer];
                return next;
              });
            });
          }
        });

        newPeer.on('error', (err) => {
          console.error('PeerJS error:', err);
          toast({
            variant: 'destructive',
            title: 'Connection Error',
            description: 'Could not connect to the voice server.',
          });
          cleanup();
        });
      } catch (error) {
        console.error('Error accessing microphone:', error);
        toast({
          variant: 'destructive',
          title: 'Microphone Access Denied',
          description:
            'Please enable microphone permissions in your browser settings to join voice channels.',
        });
        cleanup();
      }
    },
    [cleanupResources, firestore, user, userProfile, activeVoiceChannel, cleanup, toast]
  );

  const toggleMute = useCallback(() => {
    if (!localStreamRef.current || isDeafened) return;
    const nextMuted = !isMuted;
    localStreamRef.current.getAudioTracks().forEach((track) => {
      track.enabled = !nextMuted;
    });
    setIsMuted(nextMuted);
  }, [isMuted, isDeafened]);

  const toggleDeafen = useCallback(() => {
    const nextDeafened = !isDeafened;
    setIsDeafened(nextDeafened);
    if (nextDeafened) {
      setMuteStateBeforeDeafen(isMuted);
      setIsMuted(true);
      if (localStreamRef.current)
        localStreamRef.current.getAudioTracks().forEach((t) => (t.enabled = false));
    } else {
      setIsMuted(muteStateBeforeDeafen);
      if (localStreamRef.current)
        localStreamRef.current
          .getAudioTracks()
          .forEach((t) => (t.enabled = !muteStateBeforeDeafen));
    }
    // This is a client-side deafen, we are not stopping remote streams from being received, just not playing them.
    // A more robust solution would manage audio elements' muted property.
    const audioElements = document.querySelectorAll('#audio-container audio');
    audioElements.forEach((audio) => {
      (audio as HTMLAudioElement).muted = nextDeafened;
    });
  }, [isDeafened, isMuted, muteStateBeforeDeafen]);

  const value = {
    activeVoiceChannel,
    participants,
    isMuted,
    isDeafened,
    joinChannel,
    leaveChannel,
    toggleMute,
    toggleDeafen,
  };

  return (
    <VoiceContext.Provider value={value}>
      {children}
      <div id="audio-container" style={{ display: 'none' }}>
        {Object.values(remoteStreams).map((stream, index) => (
          <AudioPlayer key={index} stream={stream} />
        ))}
      </div>
    </VoiceContext.Provider>
  );
}

export function useVoice() {
  const context = useContext(VoiceContext);
  if (context === undefined) {
    throw new Error('useVoice must be used within a VoiceProvider');
  }
  return context;
}
