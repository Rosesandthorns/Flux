'use client';

import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import Image from 'next/image';
import { cn } from '@/lib/utils';
import React from 'react';

interface MessageRendererProps {
    content: string;
}

export default function MessageRenderer({ content }: MessageRendererProps) {
    // Pre-process the message to convert our custom `-# ` syntax to standard markdown `## ` for h2
    const processedContent = content.replace(/^-# /gm, '## ');

    const markdownComponents = {
        p: ({node, ...props}: any) => <p className="m-0 whitespace-pre-wrap" {...props} />,
        a: ({node, ...props}: any) => <a className="text-blue-400 hover:underline" target="_blank" rel="noopener noreferrer" {...props} />,
        img: ({node, ...props}: any) => (
            <a href={props.src || ''} target="_blank" rel="noopener noreferrer" className="block mt-2">
                <Image 
                    src={props.src || ''} 
                    alt={props.alt || 'user-image'}
                    width={400}
                    height={300}
                    className="rounded-lg max-w-xs h-auto object-cover"
                />
            </a>
        ),
         ul: ({node, ...props}: any) => <ul className="list-disc list-inside my-2 pl-2" {...props} />,
         ol: ({node, ...props}: any) => <ol className="list-decimal list-inside my-2 pl-2" {...props} />,
         pre: ({node, ...props}: any) => <pre className="bg-muted p-2 rounded-md overflow-x-auto text-sm my-2" {...props} />,
         code: ({node, inline, className, children, ...props}: any) => {
            return !inline ? (
                <code className={cn("font-mono", className)} {...props}>{children}</code>
            ) : (
                <code className="font-mono bg-muted px-1.5 py-1 rounded-md text-sm" {...props}>{children}</code>
            )
         },
         strong: ({node, ...props}: any) => <strong className="font-bold" {...props} />,
         em: ({node, ...props}: any) => <em className="italic" {...props} />,
         del: ({node, ...props}: any) => <del className="line-through" {...props} />,
         h1: ({node, ...props}: any) => <h1 className="text-2xl font-bold leading-tight my-2" {...props} />,
         h2: ({node, ...props}: any) => <h2 className="text-base font-semibold leading-tight my-1 text-muted-foreground" {...props} />,
    };

    return (
        <ReactMarkdown
            remarkPlugins={[remarkGfm]}
            className="text-foreground/90 break-words"
            components={markdownComponents}
        >
            {processedContent}
        </ReactMarkdown>
    );
}
