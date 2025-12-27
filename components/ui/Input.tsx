import React from 'react';

interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
    label?: string;
    error?: string;
    conversational?: boolean;
}

export const Input: React.FC<InputProps> = ({
    label,
    error,
    conversational = false,
    className = '',
    ...props
}) => {
    return (
        <div className="w-full animate-slide-in-up">
            {label && (
                <label
                    className={conversational ? 'label-conversational' : 'block text-sm font-semibold text-text-primary mb-2'}
                >
                    {label}
                </label>
            )}
            <input
                className={`input-field ${error ? 'border-error' : ''} ${className}`}
                {...props}
            />
            {error && (
                <p className="text-error text-sm mt-1 animate-fade-in">{error}</p>
            )}
        </div>
    );
};

export default Input;
