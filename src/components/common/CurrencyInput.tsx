import React from 'react';

interface CurrencyInputProps {
    value: string;
    onChange: (value: string) => void;
    placeholder?: string;
    className?: string;
}

const CurrencyInput: React.FC<CurrencyInputProps> = ({ value, onChange, placeholder, className }) => {
    const formatNumber = (numStr: string) => {
        if (!numStr) return '';

        const clean = numStr.replace(/,/g, '');

        if (!/^\d*\.?\d*$/.test(clean)) {
            return numStr;
        }

        const [integerPart, decimalPart] = clean.split('.');
        const formattedInteger =
            integerPart === ''
                ? ''
                : new Intl.NumberFormat('en-US').format(Number(integerPart));

        if (decimalPart !== undefined) {
            if (integerPart === '') {
                return `.${decimalPart}`;
            }

            return `${formattedInteger}.${decimalPart}`;
        }

        return formattedInteger;
    };

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const inputVal = e.target.value;
        const rawValue = inputVal.replace(/,/g, '');

        if (rawValue === '' || /^\d*\.?\d*$/.test(rawValue)) {
            onChange(rawValue);
        }
    };

    return (
        <input
            type="text"
            inputMode="decimal"
            value={formatNumber(value)}
            onChange={handleChange}
            className={className}
            placeholder={placeholder}
        />
    );
};

export default CurrencyInput;
