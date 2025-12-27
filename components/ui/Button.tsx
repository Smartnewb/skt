import React from 'react';
import { motion } from 'framer-motion';

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
    children: React.ReactNode;
    variant?: 'primary' | 'secondary';
    isLoading?: boolean;
}

export const Button: React.FC<ButtonProps> = ({
    children,
    variant = 'primary',
    isLoading = false,
    disabled,
    className = '',
    ...props
}) => {
    return (
        <motion.button
            className={`btn-primary ${className}`}
            whileTap={{ scale: disabled || isLoading ? 1 : 0.98 }}
            disabled={disabled || isLoading}
            {...props}
        >
            {isLoading ? (
                <div className="flex items-center justify-center">
                    <div className="w-6 h-6 border-3 border-white border-t-transparent rounded-full animate-spin" />
                </div>
            ) : (
                children
            )}
        </motion.button>
    );
};

export default Button;
