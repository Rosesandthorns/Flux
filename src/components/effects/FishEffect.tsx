
'use client';

import { useState, useEffect, useMemo } from 'react';

const FISH_COUNT = 10;
const FISH_EMOJIS = ['🐠', '🐟', '🐡'];

export default function FishEffect() {
  const fishes = useMemo(() => {
    return Array.from({ length: FISH_COUNT }).map((_, i) => ({
      id: i,
      emoji: FISH_EMOJIS[Math.floor(Math.random() * FISH_EMOJIS.length)],
      style: {
        top: `${Math.random() * 90}%`,
        animationDuration: `${8 + Math.random() * 12}s`,
        animationDelay: `${Math.random() * 10}s`,
        transform: `scaleX(${Math.random() > 0.5 ? 1 : -1})`,
      },
    }));
  }, []);

  return (
    <div className="fixed inset-0 pointer-events-none z-[500]">
      {fishes.map(f => (
        <div
          key={f.id}
          className="absolute text-3xl animate-swim-across"
          style={f.style}
        >
          {f.emoji}
        </div>
      ))}
    </div>
  );
}
