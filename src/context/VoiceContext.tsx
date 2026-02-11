"use client";

import { createContext, useContext, useState, useEffect, ReactNode, useCallback } from 'react';
import { PlaceHolderImages } from '@/lib/placeholder-images';

const allUsers = PlaceHolderImages.filter(img => img.id.startsWith('chat-avatar-')).map(img => ({
    id: img.id,
    name: img.id.replace('chat-avatar-', 'User ').replace('-', ' '),
    avatarUrl: img.imageUrl,
    avatarHint: img.imageHint
}));

const currentUserData = PlaceHolderImages.find(img => img.id === 'user-avatar');
const currentUser = {
    id: 'current-user',
    name: 'username',
    avatarUrl: currentUserData?.imageUrl || '',
    avatarHint: currentUserData?.imageHint || ''
};

type Participant = typeof allUsers[0];

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

  const joinChannel = useCallback((channelName: string) => {
    if (channelName === activeVoiceChannel) return;
    setActiveVoiceChannel(channelName);
    // Simulate joining with other users
    const otherUsers = [...allUsers].sort(() => 0.5 - Math.random()).slice(0, Math.floor(Math.random() * 3) + 2);
    setParticipants([currentUser, ...otherUsers]);
  }, [activeVoiceChannel]);

  const leaveChannel = useCallback(() => {
    setActiveVoiceChannel(null);
    setParticipants([]);
    setSpeakingParticipantId(null);
  }, []);

  const toggleMute = useCallback(() => {
    if (isDeafened) return;
    setIsMuted(prev => !prev);
  }, [isDeafened]);

  const toggleDeafen = useCallback(() => {
    setIsDeafened(prev => !prev);
  }, []);

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
