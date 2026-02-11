'use client';
import { useDMCall } from '@/context/DMCallContext';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { Phone, PhoneOff, Mic, MicOff, X } from 'lucide-react';
import { useEffect, useRef, useState } from 'react';
import { Card } from '../ui/card';
import { useUser } from '@/firebase';

// Ringtone component
const Ringtone = () => {
    const audioRef = useRef<HTMLAudioElement>(null);
    useEffect(() => {
        const playPromise = audioRef.current?.play();
        if (playPromise !== undefined) {
            playPromise.catch(e => console.error("Ringtone playback failed. User interaction might be required.", e));
        }
        return () => {
            audioRef.current?.pause();
        }
    }, []);

    return <audio ref={audioRef} src="/audio/ringtone.mp3" loop />;
}


// Sub-component for call UI
function CallUI() {
    const { currentCall, answerCall, declineCall, endCall, toggleMute, isMuted, remoteStream } = useDMCall();
    const [duration, setDuration] = useState(0);
    const { user } = useUser();
    
    // Timer for active call
    useEffect(() => {
        let timer: NodeJS.Timeout | null = null;
        if (currentCall?.status === 'connected') {
            timer = setInterval(() => {
                setDuration(prev => prev + 1);
            }, 1000);
        } else {
            setDuration(0);
        }
        return () => {
            if (timer) clearInterval(timer);
        };
    }, [currentCall?.status]);

    const formatDuration = (seconds: number) => {
        const h = Math.floor(seconds / 3600).toString().padStart(2, '0');
        const m = Math.floor((seconds % 3600) / 60).toString().padStart(2, '0');
        const s = (seconds % 60).toString().padStart(2, '0');
        return h !== '00' ? `${h}:${m}:${s}` : `${m}:${s}`;
    };

    if (!currentCall || !user) return null;
    
    const isCaller = user.uid === currentCall.callerId;
    const otherPartyProfile = isCaller ? currentCall.receiverProfile : currentCall.callerProfile;

    if (currentCall.status === 'ringing') {
        return (
            <div className="fixed inset-0 bg-black/70 z-[500] flex items-center justify-center animate-in fade-in-0">
                {!isCaller && <Ringtone />}
                <Card className="flex flex-col items-center p-8 gap-4 shadow-2xl animate-bounce-in">
                    <Avatar className="h-24 w-24 border-4 border-background">
                        <AvatarImage src={otherPartyProfile.photoURL} alt={otherPartyProfile.displayName} />
                        <AvatarFallback className="text-4xl">{otherPartyProfile.displayName.charAt(0)}</AvatarFallback>
                    </Avatar>
                    <div className="text-center">
                        <h2 className="text-2xl font-semibold">{otherPartyProfile.displayName}</h2>
                        <p className="text-muted-foreground">{isCaller ? 'Calling...' : 'Incoming call...'}</p>
                    </div>
                     <div className="flex gap-6 mt-4">
                        {isCaller ? (
                             <Button variant="destructive" size="icon" className="rounded-full h-16 w-16" onClick={endCall}>
                                <PhoneOff />
                            </Button>
                        ) : (
                            <>
                                <Button variant="destructive" size="icon" className="rounded-full h-16 w-16" onClick={declineCall}>
                                    <X className="h-8 w-8"/>
                                </Button>
                                <Button variant="secondary" className="rounded-full h-16 w-16 bg-green-500 hover:bg-green-600" size="icon" onClick={answerCall}>
                                    <Phone className="h-8 w-8" />
                                </Button>
                            </>
                        )}
                    </div>
                </Card>
            </div>
        )
    }

    if (currentCall.status === 'connected') {
        return (
             <Card className="fixed bottom-4 right-4 w-80 p-4 z-[500] animate-in slide-in-from-bottom-10 shadow-2xl">
                 <div className="flex items-center gap-3 mb-4">
                    <Avatar className="h-10 w-10">
                        <AvatarImage src={otherPartyProfile.photoURL} />
                        <AvatarFallback>{otherPartyProfile.displayName.charAt(0)}</AvatarFallback>
                    </Avatar>
                    <div>
                        <p className="font-semibold">{otherPartyProfile.displayName}</p>
                        <p className="text-sm text-muted-foreground">{formatDuration(duration)}</p>
                    </div>
                </div>
                <div className="flex justify-center gap-4">
                    <Button variant="secondary" size="icon" className="rounded-full h-12 w-12" onClick={toggleMute}>
                        {isMuted ? <MicOff /> : <Mic />}
                    </Button>
                     <Button variant="destructive" size="icon" className="rounded-full h-12 w-12" onClick={endCall}>
                        <PhoneOff />
                    </Button>
                </div>
                {remoteStream && <audio autoPlay ref={el => el && (el.srcObject = remoteStream)} />}
            </Card>
        );
    }
    
    return null;
}

// Main Call Manager
export default function DMCallManager() {
    const { currentCall } = useDMCall();
    
    if (!currentCall) return null;

    return <CallUI />;
}

    