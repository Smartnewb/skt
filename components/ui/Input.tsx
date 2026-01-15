import React from 'react';

interface InputProps extends Omit<React.InputHTMLAttributes<HTMLInputElement>, 'onChange'> {
    label?: string;
    error?: string;
    conversational?: boolean;
    onChange?: (value: string) => void;
}

export const Input: React.FC<InputProps> = ({
    label,
    error,
    conversational = false,
    className = '',
    onChange,
    ...props
}) => {
    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        onChange?.(e.target.value);
    };

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
                onChange={handleChange}
                {...props}
            />
            {error && (
                <p className="text-error text-sm mt-1 animate-fade-in">{error}</p>
            )}
        </div>
    );
};

export default Input;
