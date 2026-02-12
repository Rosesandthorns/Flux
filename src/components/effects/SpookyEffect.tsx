'use client';

import { useMemo } from 'react';

const SPOOKY_ITEM_COUNT = 12;
const SPOOKY_EMOJIS = ['👻', '💀', '🦇', '🎃', '🕷️', '🕸️'];

export default function SpookyEffect() {
  const items = useMemo(() => {
    return Array.from({ length: SPOOKY_ITEM_COUNT }).map((_, i) => ({
      id: i,
      emoji: SPOOKY_EMOJIS[Math.floor(Math.random() * SPOOKY_EMOJIS.length)],
      style: {
        top: `${Math.random() * 80}%`,
        animationDuration: `${8 + Math.random() * 10}s`,
        animationDelay: `${Math.random() * 10}s`,
      },
    }));
  }, []);

  return (
    <div className="absolute inset-0 pointer-events-none">
      {items.map(item => (
        <div
          key={item.id}
          className="absolute text-2xl animate-float-around"
          style={item.style}
        >
          {item.emoji}
        </div>
      ))}
    </div>
  );
}
