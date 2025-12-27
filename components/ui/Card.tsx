import React from 'react';
import { motion } from 'framer-motion';

interface CardProps {
    children: React.ReactNode;
    selected?: boolean;
    onClick?: () => void;
    badge?: string;
    className?: string;
}

export const Card: React.FC<CardProps> = ({
    children,
    selected = false,
    onClick,
    badge,
    className = '',
}) => {
    return (
        <motion.div
            className={`card ${selected ? 'card-selected' : ''} ${onClick ? 'cursor-pointer' : ''
                } ${className} relative`}
            onClick={onClick}
            whileHover={onClick ? { y: -2 } : {}}
            whileTap={onClick ? { scale: 0.99 } : {}}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3 }}
        >
            {badge && (
                <div className="absolute -top-2 -right-2 bg-gradient-to-r from-blue-500 to-blue-600 text-white text-xs font-bold px-3 py-1 rounded-full shadow-lg">
                    {badge}
                </div>
            )}
            {children}
        </motion.div>
    );
};

export default Card;
