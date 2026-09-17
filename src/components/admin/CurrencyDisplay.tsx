import React from 'react';

interface CurrencyDisplayProps {
    amount: number;
    className?: string;
    compact?: boolean;
}

export const formatNaira = (amount: number, compact = false): string => {
    if (compact) {
        if (amount >= 1_000_000) return `₦${(amount / 1_000_000).toFixed(1)}M`;
        if (amount >= 1_000) return `₦${(amount / 1_000).toFixed(1)}K`;
    }
    return `₦${amount.toLocaleString('en-NG', { minimumFractionDigits: 0, maximumFractionDigits: 0 })}`;
};

const CurrencyDisplay: React.FC<CurrencyDisplayProps> = ({ amount, className = '', compact = false }) => (
    <span className={`tabular-nums ${className}`}>
        {formatNaira(amount, compact)}
    </span>
);

export default CurrencyDisplay;
