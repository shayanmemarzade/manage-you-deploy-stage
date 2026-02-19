import { ChangeEvent } from "react";

interface TextInputFieldProps {
    label: string;
    placeholder: string;
    value: string;
    type: 'text' | 'email' | 'password' | 'tel' | 'number';
    name: string;
    maxLength?: number;
    onChange: (e: ChangeEvent<HTMLInputElement>) => void;
    error?: string;
    required?: boolean;
    disabled?: boolean;
    autoComplete?: string;
    className?: string;

}

export const TextInputField: React.FC<TextInputFieldProps> = ({
    label,
    placeholder,
    value,
    type,
    name,
    maxLength,
    onChange,
    error,
    required = false,
    disabled = false,
    autoComplete,
}) => {
    return (
        <div>
            <label className="block text-sm font-normal text-black mb-1">
                {label}
            </label>
            <input
                className={`w-full p-3 border ${error ? 'border-red-500' : 'border-gray-300'} 
                border border-black/15 rounded-[0.2vw] text-sm text-black font-light`}
                id={name}
                type={type}
                name={name}
                placeholder={placeholder}
                value={value}
                onChange={onChange}
                maxLength={maxLength}
                required={required}
                disabled={disabled}
                autoComplete={autoComplete}
                aria-invalid={!!error}
                aria-describedby={error ? `${name}-error` : undefined}

            />
            {error && (
                <p
                    id={`${name}-error`}
                    className="text-red-500 text-xs mt-1"
                    role="alert"
                >
                    {error}
                </p>
            )}
        </div>
    );
};