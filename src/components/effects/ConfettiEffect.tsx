
'use client';

import { useMemo } from 'react';

const CONFETTI_COUNT = 150;
const COLORS = ['#fde68a', '#fca5a5', '#818cf8', '#a78bfa', '#34d399', '#60a5fa'];

export default function ConfettiEffect() {
  const pieces = useMemo(() => {
    return Array.from({ length: CONFETTI_COUNT }).map((_, i) => ({
      id: i,
      style: {
        left: `${Math.random() * 100}%`,
        top: `${-20 + Math.random() * -80}px`,
        backgroundColor: COLORS[Math.floor(Math.random() * COLORS.length)],
        animationDelay: `${Math.random() * 5}s`,
        transform: `rotate(${Math.random() * 360}deg)`,
      },
    }));
  }, []);

  return (
    <div className="absolute inset-0 pointer-events-none">
      {pieces.map(p => (
        <div
          key={p.id}
          className="absolute w-2 h-4 animate-confetti-fall"
          style={p.style}
        />
      ))}
    </div>
  );
}
