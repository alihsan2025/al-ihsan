import React, { useState } from 'react';
import { ArrowRight, Calculator, Check, AlertCircle, HelpCircle, X, Scale } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useGoldPrice } from '../../hooks/useGoldPrice';
import CurrencyInput from '../common/CurrencyInput';
import { motion, AnimatePresence } from 'framer-motion';

const ZakatCalculator: React.FC = () => {
    const navigate = useNavigate();
    const { goldPrice, silverPrice, goldNisabValue } = useGoldPrice();

    const [cash, setCash] = useState<string>('');

    // Gold State
    const [goldInputMode, setGoldInputMode] = useState<'grams' | 'value'>('grams');
    const [goldInput, setGoldInput] = useState<string>('');

    // Silver State
    const [silverInputMode, setSilverInputMode] = useState<'grams' | 'value'>('grams');
    const [silverInput, setSilverInput] = useState<string>('');

    const [liabilities, setLiabilities] = useState<string>('');
    const [isBelowNisab, setIsBelowNisab] = useState<boolean>(false);
    const [showHelp, setShowHelp] = useState(false);

    const formatCurrency = (amount: number) => {
        return new Intl.NumberFormat('en-NG', {
            style: 'currency',
            currency: 'NGN',
            minimumFractionDigits: 2
        }).format(amount);
    };

    // Derived Values
    const getGoldValue = () => {
        const raw = parseFloat(goldInput) || 0;
        if (goldInputMode === 'grams') return raw * (goldPrice || 0);
        return raw;
    };

    const getSilverValue = () => {
        const raw = parseFloat(silverInput) || 0;
        if (silverInputMode === 'grams') return raw * (silverPrice || 0);
        return raw;
    };

    const calculateZakat = () => {
        const c = parseFloat(cash) || 0;
        const g = getGoldValue();
        const s = getSilverValue();
        const l = parseFloat(liabilities) || 0;

        const totalNetAssets = (c + g + s) - l;

        if (totalNetAssets < goldNisabValue) {
            if (!isBelowNisab && totalNetAssets > 0) setIsBelowNisab(true);
            else if (isBelowNisab && totalNetAssets <= 0) setIsBelowNisab(false);
            return totalNetAssets > 0 ? "Below Nisab" : "₦0.00";
        }

        if (isBelowNisab) setIsBelowNisab(false);
        const zakatAmount = totalNetAssets * 0.025;
        return formatCurrency(zakatAmount);
    };

    const zakatValue = calculateZakat();
    const isPayable = zakatValue !== "Below Nisab" && zakatValue !== "₦0.00" && !zakatValue.includes("NaN");

    const PAYSTACK_URL = "https://paystack.com/pay/al-ihsan-zakat";

    const handleFullCalculation = () => {
        navigate('/zakat', {
            state: {
                cash: parseFloat(cash) || 0,
                gold: getGoldValue(),
                silver: getSilverValue(),
                liabilities: parseFloat(liabilities) || 0,
            }
        });
    };

    return (
        <div className={`bg-white p-8 rounded-2xl shadow-xl border border-gold-100 transition-all relative`}>

            <button
                onClick={() => setShowHelp(!showHelp)}
                className="absolute top-6 right-6 text-gray-400 hover:text-gold-500 transition-colors"
                aria-label="How to use"
            >
                <HelpCircle size={20} />
            </button>

            <AnimatePresence>
                {showHelp && (
                    <motion.div
                        initial={{ opacity: 0, y: -10 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -10 }}
                        className="absolute inset-0 bg-white/95 backdrop-blur-sm z-20 rounded-2xl p-6 flex flex-col justify-center text-center"
                    >
                        <button
                            onClick={() => setShowHelp(false)}
                            className="absolute top-4 right-4 text-gray-500 hover:text-red-500"
                        >
                            <X size={20} />
                        </button>
                        <h4 className="font-bold text-primary-900 mb-4 text-lg">How to Use</h4>
                        <ul className="text-sm text-gray-600 space-y-3 text-left pl-4 list-disc">
                            <li>Enter your total <strong>Cash Savings</strong>.</li>
                            <li>Enter the <strong>Weight (grams)</strong> of Gold/Silver you own. We calculate the value automatically.</li>
                            <li>Or switch to "Value" mode if you know the exact worth.</li>
                            <li>Enter immediate <strong>Debts</strong> you owe.</li>
                            <li>If net worth &ge; Nisab (approx {formatCurrency(goldNisabValue)}), pay 2.5%.</li>
                        </ul>
                        <button
                            onClick={() => setShowHelp(false)}
                            className="mt-6 py-2 bg-gold-500 text-primary-900 font-bold rounded-lg text-sm"
                        >
                            Got it, thanks!
                        </button>
                    </motion.div>
                )}
            </AnimatePresence>

            <div className="flex items-center gap-3 mb-6">
                <div className="p-3 bg-gold-100 rounded-lg text-gold-600">
                    <Calculator size={24} />
                </div>
                <div>
                    <h3 className="text-xl font-heading font-bold text-primary-900">Mini Zakat Calculator</h3>
                    <p className="text-xs text-gray-500">Calculate 2.5% of your wealth</p>
                </div>
            </div>

            <div className="space-y-4 mb-6">
                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Cash Savings (₦)</label>
                    <CurrencyInput
                        value={cash}
                        onChange={setCash}
                        className="w-full p-3 bg-gray-50 rounded-lg border border-gray-200 focus:border-gold-500 focus:ring-1 focus:ring-gold-500 outline-none transition-all placeholder:text-gray-300"
                        placeholder="0.00"
                    />
                </div>

                <div className="grid grid-cols-2 gap-4">
                    {/* GOLD INPUT */}
                    <div>
                        <div className="flex justify-between items-center mb-1">
                            <label className="block text-sm font-medium text-gray-700">Gold</label>
                            <button
                                onClick={() => setGoldInputMode(prev => prev === 'grams' ? 'value' : 'grams')}
                                className="text-[10px] uppercase font-bold tracking-wider text-gold-600 bg-gold-50 px-2 py-0.5 rounded hover:bg-gold-100 transition-colors flex items-center gap-1"
                            >
                                {goldInputMode === 'grams' ? <><Scale size={8} /> Grams</> : 'Value'}
                            </button>
                        </div>
                        <CurrencyInput
                            value={goldInput}
                            onChange={setGoldInput}
                            className={`w-full p-3 bg-gray-50 rounded-lg border focus:ring-1 outline-none transition-all placeholder:text-gray-300 ${goldInputMode === 'grams' ? 'border-orange-200 focus:border-orange-500 focus:ring-orange-500' : 'border-gray-200 focus:border-gold-500 focus:ring-gold-500'}`}
                            placeholder={goldInputMode === 'grams' ? "Weight (g)" : "Value (₦)"}
                        />
                        {goldInputMode === 'grams' && parseFloat(goldInput) > 0 && (
                            <p className="text-[10px] text-gray-400 mt-1 truncate">
                                ≈ {formatCurrency(parseFloat(goldInput) * (goldPrice || 0))}
                            </p>
                        )}
                    </div>

                    {/* SILVER INPUT */}
                    <div>
                        <div className="flex justify-between items-center mb-1">
                            <label className="block text-sm font-medium text-gray-700">Silver</label>
                            <button
                                onClick={() => setSilverInputMode(prev => prev === 'grams' ? 'value' : 'grams')}
                                className="text-[10px] uppercase font-bold tracking-wider text-gray-600 bg-gray-100 px-2 py-0.5 rounded hover:bg-gray-200 transition-colors flex items-center gap-1"
                            >
                                {silverInputMode === 'grams' ? <><Scale size={8} /> Grams</> : 'Value'}
                            </button>
                        </div>
                        <CurrencyInput
                            value={silverInput}
                            onChange={setSilverInput}
                            className={`w-full p-3 bg-gray-50 rounded-lg border focus:ring-1 outline-none transition-all placeholder:text-gray-300 ${silverInputMode === 'grams' ? 'border-orange-200 focus:border-orange-500 focus:ring-orange-500' : 'border-gray-200 focus:border-gold-500 focus:ring-gold-500'}`}
                            placeholder={silverInputMode === 'grams' ? "Weight (g)" : "Value (₦)"}
                        />
                        {silverInputMode === 'grams' && parseFloat(silverInput) > 0 && (
                            <p className="text-[10px] text-gray-400 mt-1 truncate">
                                ≈ {formatCurrency(parseFloat(silverInput) * (silverPrice || 0))}
                            </p>
                        )}
                    </div>
                </div>

                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1 flex items-center justify-between">
                        Debts to Pay (Liabilities)
                        <span className="text-[10px] bg-red-50 text-red-500 px-2 py-0.5 rounded-full font-bold uppercase tracking-wider">Deducted</span>
                    </label>
                    <CurrencyInput
                        value={liabilities}
                        onChange={setLiabilities}
                        className="w-full p-3 bg-red-50/50 rounded-lg border border-red-100 focus:border-red-500 focus:ring-1 focus:ring-red-500 outline-none transition-all placeholder:text-gray-300"
                        placeholder="0.00"
                    />
                </div>
            </div>

            <div className={`p-4 rounded-xl flex justify-between items-center mb-4 transition-colors duration-300 ${isBelowNisab ? 'bg-gray-100 text-gray-500' : 'bg-primary-900 text-white'}`}>
                <div className="flex flex-col">
                    <span className={`text-xs font-medium ${isBelowNisab ? 'text-gray-400' : 'text-primary-200'}`}>Estimated Zakat:</span>
                    {isBelowNisab && <span className="text-[10px] mt-0.5">Wealth below Nisab threshold</span>}
                </div>
                <span className={`text-2xl font-bold ${isBelowNisab ? 'text-gray-400' : 'text-gold-400'}`}>
                    {(cash || goldInput || silverInput) ? zakatValue : '---'}
                </span>
            </div>

            <div className="grid grid-cols-2 gap-3">
                <button
                    onClick={handleFullCalculation}
                    className="py-3 px-4 border-2 border-primary-900 text-primary-900 font-bold rounded-full hover:bg-primary-50 transition-all flex items-center justify-center gap-2 text-sm"
                >
                    Full Calc <ArrowRight size={16} />
                </button>

                {isPayable ? (
                    <a
                        href={PAYSTACK_URL}
                        target="_blank"
                        rel="noreferrer"
                        className="py-3 px-4 bg-gold-500 border-2 border-gold-500 text-primary-900 font-bold rounded-full hover:bg-gold-400 transition-all flex items-center justify-center gap-2 text-sm shadow-lg animate-pulse"
                    >
                        Pay Now <Check size={16} />
                    </a>
                ) : (
                    <button
                        disabled
                        className="py-3 px-4 bg-gray-100 border-2 border-gray-100 text-gray-400 font-bold rounded-full flex items-center justify-center gap-2 text-sm cursor-not-allowed"
                    >
                        Pay Now <Check size={16} />
                    </button>
                )}
            </div>

            <div className="mt-4 flex items-center justify-center gap-1.5 text-[10px] text-gray-400">
                <AlertCircle size={10} />
                <span>Rates: Gold {formatCurrency(goldPrice || 0)}/g • Silver {formatCurrency(silverPrice || 0)}/g</span>
            </div>
        </div>
    );
};

export default ZakatCalculator;
