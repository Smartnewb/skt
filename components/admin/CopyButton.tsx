'use client';

import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';

interface CopyButtonProps {
    text: string;
    label?: string;
}

export function CopyButton({ text, label }: CopyButtonProps) {
    const [copied, setCopied] = React.useState(false);

    const handleCopy = async () => {
        try {
            await navigator.clipboard.writeText(text);
            setCopied(true);
            setTimeout(() => setCopied(false), 2000);
        } catch (err) {
            console.error('Failed to copy:', err);
        }
    };

    return (
        <div className="inline-flex items-center gap-2">
            {label && <span className="text-gray-600 text-sm">{label}:</span>}
            <span className="font-medium">{text}</span>
            <button
                onClick={handleCopy}
                className="p-1 hover:bg-gray-100 rounded transition relative"
                title="클립보드에 복사"
            >
                <AnimatePresence mode="wait">
                    {copied ? (
                        <motion.span
                            key="check"
                            initial={{ scale: 0 }}
                            animate={{ scale: 1 }}
                            exit={{ scale: 0 }}
                            className="text-green-500"
                        >
                            ✓
                        </motion.span>
                    ) : (
                        <motion.span
                            key="copy"
                            initial={{ scale: 0 }}
                            animate={{ scale: 1 }}
                            exit={{ scale: 0 }}
                        >
                            📋
                        </motion.span>
                    )}
                </AnimatePresence>
            </button>
        </div>
    );
}
