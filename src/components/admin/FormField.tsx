import React from 'react';

const inputBase = 'w-full px-3 py-2 bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-700 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500 outline-none transition-shadow text-sm text-slate-900 dark:text-white placeholder:text-slate-400';

interface FormFieldProps {
    label: string;
    name: string;
    value: string | number;
    onChange: (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => void;
    type?: 'text' | 'email' | 'number' | 'url' | 'date' | 'textarea' | 'select';
    placeholder?: string;
    required?: boolean;
    rows?: number;
    options?: { value: string; label: string }[];
    prefix?: string;
    disabled?: boolean;
}

const FormField: React.FC<FormFieldProps> = ({
    label, name, value, onChange, type = 'text', placeholder, required, rows = 3, options, prefix, disabled
}) => {
    const labelEl = (
        <label htmlFor={name} className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1.5 tracking-tight">
            {label}{required && <span className="text-red-500 ml-0.5">*</span>}
        </label>
    );

    if (type === 'textarea') {
        return (
            <div>
                {labelEl}
                <textarea id={name} name={name} value={value} onChange={onChange} rows={rows} required={required} placeholder={placeholder} disabled={disabled} className={inputBase} />
            </div>
        );
    }

    if (type === 'select' && options) {
        return (
            <div>
                {labelEl}
                <select id={name} name={name} value={value} onChange={onChange} required={required} disabled={disabled} className={inputBase}>
                    {options.map(o => <option key={o.value} value={o.value}>{o.label}</option>)}
                </select>
            </div>
        );
    }

    return (
        <div>
            {labelEl}
            <div className={prefix ? 'relative' : ''}>
                {prefix && (
                    <span className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 text-sm font-medium pointer-events-none">{prefix}</span>
                )}
                <input
                    id={name} name={name} type={type} value={value} onChange={onChange}
                    required={required} placeholder={placeholder} disabled={disabled}
                    className={`${inputBase} ${prefix ? 'pl-8' : ''}`}
                />
            </div>
        </div>
    );
};

export default FormField;
