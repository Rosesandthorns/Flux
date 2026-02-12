
'use client';

import React, { useState, useEffect, useMemo } from 'react';
import MessageRenderer from './MessageRenderer';
import ConfettiEffect from './effects/ConfettiEffect';
import FishEffect from './effects/FishEffect';

interface SpecialMessageRendererProps {
    content: string;
}

const COLOR_MAP: { [key: string]: string } = {
    red: 'text-red-500',
    green: 'text-green-500',
    blue: 'text-blue-500',
};

const RESERVED_KEYWORDS = {
    CONF_KEY: 'confetti@flux',
    FISH_KEY: 'fish@flux',
    COLOR_REGEX: /(red|green|blue)@flux/g,
};

export default function SpecialMessageRenderer({ content }: SpecialMessageRendererProps) {
    const [renderKey, setRenderKey] = useState(0);

    const { processedContent, colorClass, hasConfetti, hasFish } = useMemo(() => {
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
        
        const colorMatch = tempContent.match(RESERVED_KEYWORDS.COLOR_REGEX);
        if (colorMatch) {
            const color = colorMatch[0].split('@')[0];
            colorClass = COLOR_MAP[color] || '';
            tempContent = tempContent.replace(RESERVED_KEYWORDS.COLOR_REGEX, '');
        }

        return { processedContent: tempContent, colorClass, hasConfetti, hasFish };
    }, [content]);

    useEffect(() => {
        setRenderKey(prev => prev + 1);
    }, [hasConfetti, hasFish]);
    
    return (
        <div className={colorClass}>
            {hasConfetti && <ConfettiEffect key={`confetti-${renderKey}`} />}
            {hasFish && <FishEffect key={`fish-${renderKey}`} />}
            <MessageRenderer content={processedContent} />
        </div>
    );
}
