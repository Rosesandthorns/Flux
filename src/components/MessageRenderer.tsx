'use client';

import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import Image from 'next/image';
import { cn } from '@/lib/utils';

interface MessageRendererProps {
    content: string;
}

export default function MessageRenderer({ content }: MessageRendererProps) {
    // Custom Discord-like headers
    if (content.startsWith('# ')) {
        return <h1 className="text-2xl font-bold leading-tight my-2">{content.substring(2)}</h1>;
    }
    if (content.startsWith('-# ')) {
        return <h2 className="text-base font-semibold leading-tight my-1 text-muted-foreground">{content.substring(3)}</h2>;
    }

    return (
        <ReactMarkdown
            remarkPlugins={[remarkGfm]}
            className="text-foreground/90 break-words"
            components={{
                p: ({node, ...props}) => <p className="m-0 whitespace-pre-wrap" {...props} />,
                a: ({node, ...props}) => <a className="text-blue-400 hover:underline" target="_blank" rel="noopener noreferrer" {...props} />,
                img: ({node, ...props}) => (
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
                 ul: ({node, ...props}) => <ul className="list-disc list-inside" {...props} />,
                 ol: ({node, ...props}) => <ol className="list-decimal list-inside" {...props} />,
                 pre: ({node, ...props}) => <pre className="bg-muted p-2 rounded-md overflow-x-auto text-sm my-2" {...props} />,
                 code: ({node, inline, className, children, ...props}) => {
                    return !inline ? (
                        <code className={cn("font-mono", className)} {...props}>{children}</code>
                    ) : (
                        <code className="font-mono bg-muted px-1.5 py-1 rounded-md text-sm" {...props}>{children}</code>
                    )
                 },
                 strong: ({node, ...props}) => <strong className="font-bold" {...props} />,
                 em: ({node, ...props}) => <em className="italic" {...props} />,
                 del: ({node, ...props}) => <del className="line-through" {...props} />,
            }}
        >
            {content}
        </ReactMarkdown>
    );
}
