import React from 'react';

interface SelectProps extends React.SelectHTMLAttributes<HTMLSelectElement> {
    label?: string;
    error?: string;
    conversational?: boolean;
    options: { value: string; label: string }[];
}

export const Select: React.FC<SelectProps> = ({
    label,
    error,
    conversational = false,
    options,
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
            <select
                className={`input-field ${error ? 'border-error' : ''} ${className} appearance-none bg-white cursor-pointer`}
                style={{
                    backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' fill='none' viewBox='0 0 24 24' stroke='%23737373'%3E%3Cpath stroke-linecap='round' stroke-linejoin='round' stroke-width='2' d='M19 9l-7 7-7-7'%3E%3C/path%3E%3C/svg%3E")`,
                    backgroundRepeat: 'no-repeat',
                    backgroundPosition: 'right 1rem center',
                    backgroundSize: '1.5rem',
                    paddingRight: '3rem',
                }}
                {...props}
            >
                <option value="">선택해주세요</option>
                {options.map((option) => (
                    <option key={option.value} value={option.value}>
                        {option.label}
                    </option>
                ))}
            </select>
            {error && (
                <p className="text-error text-sm mt-1 animate-fade-in">{error}</p>
            )}
        </div>
    );
};

export default Select;
