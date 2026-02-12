'use client';

import { useMemo } from 'react';

const ZOO_ANIMAL_COUNT = 10;
const ZOO_EMOJIS = ['🦁', '🐯', '🐻', '🐘', '🦒', '🦓', '🐵', '🐍', '🐊'];

export default function ZooEffect() {
  const animals = useMemo(() => {
    return Array.from({ length: ZOO_ANIMAL_COUNT }).map((_, i) => ({
      id: i,
      emoji: ZOO_EMOJIS[Math.floor(Math.random() * ZOO_EMOJIS.length)],
      style: {
        top: `${Math.random() * 90}%`,
        animationDuration: `${8 + Math.random() * 12}s`,
        animationDelay: `${Math.random() * 10}s`,
        transform: `scaleX(${Math.random() > 0.5 ? 1 : -1})`,
      },
    }));
  }, []);

  return (
    <div className="absolute inset-0 pointer-events-none">
      {animals.map(a => (
        <div
          key={a.id}
          className="absolute text-3xl animate-swim-across"
          style={a.style}
        >
          {a.emoji}
        </div>
      ))}
    </div>
  );
}
