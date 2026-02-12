'use client';

import React, { useState, useEffect, useMemo } from 'react';
import MessageRenderer from './MessageRenderer';
import ConfettiEffect from './effects/ConfettiEffect';
import FishEffect from './effects/FishEffect';
import ZooEffect from './effects/ZooEffect';
import SpaceEffect from './effects/SpaceEffect';
import SpookyEffect from './effects/SpookyEffect';

interface SpecialMessageRendererProps {
    content: string;
}

const COLOR_MAP: { [key: string]: string } = {
    red: 'text-red-500',
    green: 'text-green-500',
    blue: 'text-blue-500',
    yellow: 'text-yellow-500',
    orange: 'text-orange-500',
    pink: 'text-pink-500',
};

const RESERVED_KEYWORDS = {
    CONF_KEY: 'confetti@flux',
    FISH_KEY: 'fish@flux',
    ZOO_KEY: 'zoo@flux',
    SPACE_KEY: 'space@flux',
    SPOOKY_KEY: 'spooky@flux',
    COLOR_REGEX: /(red|green|blue|yellow|orange|pink)@flux/,
};

export default function SpecialMessageRenderer({ content }: SpecialMessageRendererProps) {
    const [renderKey, setRenderKey] = useState(0);

    const { processedContent, colorClass, hasConfetti, hasFish, hasZoo, hasSpace, hasSpooky } = useMemo(() => {
        let tempContent = content;
        let colorClass = '';
        
        const hasConfetti = tempContent.includes(RESERVED_KEYWORDS.CONF_KEY);
        if (hasConfetti) {
            tempContent = tempContent.replace(new RegExp(RESERVED_KEYWORDS.CONF_KEY, 'g'), '');
        }

        const hasFish = tempContent.includes(RESERVED_KEYWORDS.FISH_KEY);
        if (hasFish) {
            tempContent = tempContent.replace(new RegExp(RESERVED_KEYWORDS.FISH_KEY, 'g'), '');
        }
        
        const hasZoo = tempContent.includes(RESERVED_KEYWORDS.ZOO_KEY);
        if (hasZoo) {
            tempContent = tempContent.replace(new RegExp(RESERVED_KEYWORDS.ZOO_KEY, 'g'), '');
        }

        const hasSpace = tempContent.includes(RESERVED_KEYWORDS.SPACE_KEY);
        if (hasSpace) {
            tempContent = tempContent.replace(new RegExp(RESERVED_KEYWORDS.SPACE_KEY, 'g'), '');
        }
        
        const hasSpooky = tempContent.includes(RESERVED_KEYWORDS.SPOOKY_KEY);
        if (hasSpooky) {
            tempContent = tempContent.replace(new RegExp(RESERVED_KEYWORDS.SPOOKY_KEY, 'g'), '');
        }

        const colorMatch = tempContent.match(RESERVED_KEYWORDS.COLOR_REGEX);
        if (colorMatch) {
            const color = colorMatch[1];
            colorClass = COLOR_MAP[color as keyof typeof COLOR_MAP] || '';
            tempContent = tempContent.replace(RESERVED_KEYWORDS.COLOR_REGEX, '');
        }

        return { processedContent: tempContent.trim(), colorClass, hasConfetti, hasFish, hasZoo, hasSpace, hasSpooky };
    }, [content]);

    useEffect(() => {
        setRenderKey(prev => prev + 1);
    }, [hasConfetti, hasFish, hasZoo, hasSpace, hasSpooky]);
    
    return (
        <div className="relative w-full overflow-hidden -my-4 py-4">
            {hasConfetti && <ConfettiEffect key={`confetti-${renderKey}`} />}
            {hasFish && <FishEffect key={`fish-${renderKey}`} />}
            {hasZoo && <ZooEffect key={`zoo-${renderKey}`} />}
            {hasSpace && <SpaceEffect key={`space-${renderKey}`} />}
            {hasSpooky && <SpookyEffect key={`spooky-${renderKey}`} />}
            <MessageRenderer content={processedContent} className={colorClass} />
        </div>
    );
}
