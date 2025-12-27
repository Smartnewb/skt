'use client';

import React from 'react';
import { motion } from 'framer-motion';

interface ProgressBarProps {
    currentStep: number;
    totalSteps: number;
}

export const ProgressBar: React.FC<ProgressBarProps> = ({
    currentStep,
    totalSteps,
}) => {
    const progress = (currentStep / totalSteps) * 100;

    return (
        <div className="fixed top-0 left-0 right-0 z-50 bg-white border-b border-border">
            <div className="h-1 bg-gray-200">
                <motion.div
                    className="progress-bar"
                    initial={{ width: 0 }}
                    animate={{ width: `${progress}%` }}
                    transition={{ duration: 0.5, ease: 'easeOut' }}
                />
            </div>
            <div className="px-4 py-2 flex items-center justify-between">
                <button
                    className="text-sm text-text-secondary"
                    onClick={() => window.history.back()}
                >
                    ← 이전
                </button>
                <span className="text-sm font-semibold text-text-primary">
                    {currentStep} / {totalSteps}
                </span>
            </div>
        </div>
    );
};

export default ProgressBar;
