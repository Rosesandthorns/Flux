'use client';

import { useMemo } from 'react';

const SPACE_ITEM_COUNT = 15;
const SPACE_EMOJIS = ['🚀', '🪐', '⭐', '👽', '☄️', '✨'];

export default function SpaceEffect() {
  const items = useMemo(() => {
    return Array.from({ length: SPACE_ITEM_COUNT }).map((_, i) => ({
      id: i,
      emoji: SPACE_EMOJIS[Math.floor(Math.random() * SPACE_EMOJIS.length)],
      style: {
        top: `${Math.random() * 80}%`,
        animationDuration: `${10 + Math.random() * 15}s`,
        animationDelay: `${Math.random() * 12}s`,
        transform: `rotate(${Math.random() * 360}deg)`,
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
