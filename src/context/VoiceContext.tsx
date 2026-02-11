"use client";

import { createContext, useContext, useState, useEffect, ReactNode, useCallback } from 'react';
import { PlaceHolderImages } from '@/lib/placeholder-images';
import { useUserProfile } from '@/firebase';
import { useToast } from '@/hooks/use-toast';

// Simulation for other users in the voice channel
const otherUsersSample = PlaceHolderImages.filter(img => img.id.startsWith('chat-avatar-')).map(img => ({
    id: img.id,
    name: img.id.replace('chat-avatar-', 'User ').replace('-', ' '),
    avatarUrl: img.imageUrl,
    avatarHint: img.imageHint
}));

type Participant = {
    id: string;
    name: string;
    avatarUrl: string;
    avatarHint?: string;
};

interface VoiceContextType {
  activeVoiceChannel: string | null;
  participants: Participant[];
  speakingParticipantId: string | null;
  isMuted: boolean;
  isDeafened: boolean;
  joinChannel: (channelName: string) => void;
  leaveChannel: () => void;
  toggleMute: () => void;
  toggleDeafen: () => void;
}

const VoiceContext = createContext<VoiceContextType | undefined>(undefined);

export function VoiceProvider({ children }: { children: ReactNode }) {
  const [activeVoiceChannel, setActiveVoiceChannel] = useState<string | null>(null);
  const [participants, setParticipants] = useState<Participant[]>([]);
  const [speakingParticipantId, setSpeakingParticipantId] = useState<string | null>(null);
  const [isMuted, setIsMuted] = useState(false);
  const [isDeafened, setIsDeafened] = useState(false);
  const [stream, setStream] = useState<MediaStream | null>(null);
  const [muteStateBeforeDeafen, setMuteStateBeforeDeafen] = useState(false);

  const { data: userProfile } = useUserProfile();
  const { toast } = useToast();

  const leaveChannel = useCallback(() => {
    stream?.getTracks().forEach(track => track.stop());
    setStream(null);
    setActiveVoiceChannel(null);
    setParticipants([]);
    setSpeakingParticipantId(null);
    setIsMuted(false);
    setIsDeafened(false);
  }, [stream]);

  const joinChannel = useCallback(async (channelName: string) => {
    if (channelName === activeVoiceChannel) return;

    if (activeVoiceChannel) {
        leaveChannel();
    }

    try {
        const audioStream = await navigator.mediaDevices.getUserMedia({ audio: true, video: false });
        setStream(audioStream);
        setActiveVoiceChannel(channelName);
        setIsMuted(false);
        setIsDeafened(false);
    } catch (error) {
        console.error("Error accessing microphone:", error);
        toast({
            variant: "destructive",
            title: "Microphone Access Denied",
            description: "Please enable microphone permissions in your browser settings to join voice channels.",
        });
        leaveChannel(); // Ensure we are in a clean state
    }
  }, [activeVoiceChannel, toast, leaveChannel]);
  
    useEffect(() => {
        if (activeVoiceChannel && userProfile) {
            const currentUser: Participant = {
                id: 'current-user',
                name: userProfile.displayName,
                avatarUrl: userProfile.photoURL || '',
            };
            // Simulate joining with other users for demo purposes
            const otherUsers = [...otherUsersSample].sort(() => 0.5 - Math.random()).slice(0, Math.floor(Math.random() * 3) + 2);
            setParticipants([currentUser, ...otherUsers]);
        }
  }, [activeVoiceChannel, userProfile]);


  const toggleMute = useCallback(() => {
    if (!stream || isDeafened) return; // Cannot mute/unmute if deafened

    const nextMuted = !isMuted;
    stream.getAudioTracks().forEach(track => {
      track.enabled = !nextMuted;
    });
    setIsMuted(nextMuted);
  }, [stream, isMuted, isDeafened]);


  const toggleDeafen = useCallback(() => {
    if (!stream) return;
    const nextDeafened = !isDeafened;
    setIsDeafened(nextDeafened);

    if (nextDeafened) {
        setMuteStateBeforeDeafen(isMuted); // Save current mute state
        stream.getAudioTracks().forEach(track => {
            track.enabled = false;
        });
        setIsMuted(true); // Deafening always mutes
    } else {
        // When undeafening, restore the pre-deafen mute state.
        setIsMuted(muteStateBeforeDeafen);
        stream.getAudioTracks().forEach(track => {
            track.enabled = !muteStateBeforeDeafen;
        });
    }
  }, [stream, isMuted, muteStateBeforeDeafen]);

  // Speaking simulation for other users
  useEffect(() => {
    if (!activeVoiceChannel || participants.length <= 1) {
      setSpeakingParticipantId(null);
      return;
    }

    const interval = setInterval(() => {
      const isSomeoneSpeaking = Math.random() > 0.4;
      if (isSomeoneSpeaking) {
        const otherParticipants = participants.filter(p => p.id !== 'current-user');
        if (otherParticipants.length > 0) {
            const randomParticipant = otherParticipants[Math.floor(Math.random() * otherParticipants.length)];
            setSpeakingParticipantId(randomParticipant.id);
        }
      } else {
        setSpeakingParticipantId(null);
      }
    }, 2000);

    return () => clearInterval(interval);
  }, [activeVoiceChannel, participants]);

  // Cleanup stream on component unmount
  useEffect(() => {
    return () => {
        stream?.getTracks().forEach(track => track.stop());
    }
  }, [stream]);
  

  const value = {
    activeVoiceChannel,
    participants,
    speakingParticipantId,
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
