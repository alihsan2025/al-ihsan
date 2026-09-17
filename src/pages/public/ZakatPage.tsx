import React, { useState } from 'react';
import { useLocation, Link } from 'react-router-dom';
import SEO from '../../components/common/SEO';
import { motion, AnimatePresence } from 'framer-motion';
import { ArrowLeft, Calculator, AlertTriangle, TrendingUp, Coins, Wallet, Scale } from 'lucide-react';
import { useGoldPrice } from '../../hooks/useGoldPrice';
import CurrencyInput from '../../components/common/CurrencyInput';

interface ZakatLocationState {
    cash?: number;
    gold?: number;
    silver?: number;
    liabilities?: number;
}

const ZakatPage: React.FC = () => {
    const location = useLocation();
    const initialState = (location.state as ZakatLocationState | null) ?? null;

    const { goldPrice, silverPrice, goldNisabValue, lastUpdated, loading } = useGoldPrice();

    const [assets, setAssets] = useState(() => ({
        cashInHand: '',
        cashInBank: initialState?.cash ? initialState.cash.toString() : '',
        goldInput: initialState?.gold ? initialState.gold.toString() : '',
        silverInput: initialState?.silver ? initialState.silver.toString() : '',
        investments: '',
        businessGoods: '',
        moneyOwedToYou: '',
    }));

    const [goldMode, setGoldMode] = useState<'grams' | 'value'>(
        initialState?.gold ? 'value' : 'grams'
    );
    const [silverMode, setSilverMode] = useState<'grams' | 'value'>(
        initialState?.silver ? 'value' : 'grams'
    );

    const [liabilities, setLiabilities] = useState(() => ({
        debtsOwed: initialState?.liabilities ? initialState.liabilities.toString() : '',
        expenses: '',
    }));

    const [activeTab, setActiveTab] = useState<'a' | 'b' | 'c'>('a');

    const handleAssetChange = (field: keyof typeof assets, value: string) => {
        if (value === '' || /^\d*\.?\d*$/.test(value)) {
            setAssets(prev => ({ ...prev, [field]: value }));
        }
    };

    const handleLiabilityChange = (field: keyof typeof liabilities, value: string) => {
        if (value === '' || /^\d*\.?\d*$/.test(value)) {
            setLiabilities(prev => ({ ...prev, [field]: value }));
        }
    };

    // Calculation Logic
    const parse = (val: string) => parseFloat(val) || 0;

    const totalCash = parse(assets.cashInHand) + parse(assets.cashInBank);

    // Resolve Gold/Silver Value
    const goldVal = goldMode === 'grams' ? parse(assets.goldInput) * (goldPrice || 0) : parse(assets.goldInput);
    const silverVal = silverMode === 'grams' ? parse(assets.silverInput) * (silverPrice || 0) : parse(assets.silverInput);

    const totalGoldSilver = goldVal + silverVal;

    const totalBusiness = parse(assets.investments) + parse(assets.businessGoods) + parse(assets.moneyOwedToYou);

    const totalAssets = totalCash + totalGoldSilver + totalBusiness;
    const totalLiabilities = parse(liabilities.debtsOwed) + parse(liabilities.expenses);
    const netZakatWorth = totalAssets - totalLiabilities;

    const isEligible = netZakatWorth >= goldNisabValue;
    const zakatPayable = isEligible ? netZakatWorth * 0.025 : 0;

    const formatCurrency = (amount: number) => {
        return new Intl.NumberFormat('en-NG', {
            style: 'currency',
            currency: 'NGN',
            minimumFractionDigits: 2,
            maximumFractionDigits: 2
        }).format(amount);
    };

    const PAYSTACK_URL = "https://paystack.com/pay/al-ihsan-zakat";

    return (
        <div className="min-h-screen bg-gray-50 pt-24 pb-20">
            <SEO
                title="Full Zakat Calculator - Al-Ihsan"
                description="Comprehensive Zakat assessment tool for cash, gold, business assets and liabilities."
            />

            <div className="container mx-auto px-4 max-w-5xl">
                <Link to="/" className="inline-flex items-center gap-2 text-gray-500 hover:text-gold-600 mb-8 transition-colors text-sm font-bold uppercase tracking-wider">
                    <ArrowLeft size={16} /> Back to Home
                </Link>

                <div className="flex flex-col lg:flex-row gap-8">
                    {/* LEFT COLUMN: INPUT FORMS */}
                    <div className="flex-1">
                        <div className="bg-white rounded-2xl shadow-xl border border-gray-100 overflow-hidden">
                            <div className="p-6 md:p-8 border-b border-gray-100">
                                <h1 className="text-3xl font-heading font-bold text-primary-900 mb-2">Zakat Calculator</h1>
                                <p className="text-gray-500">Enter your assets and liabilities to calculate your obligation.</p>
                            </div>

                            {/* TABS */}
                            <div className="flex border-b border-gray-100 bg-gray-50/50">
                                <button
                                    onClick={() => setActiveTab('a')}
                                    className={`flex-1 py-4 text-sm font-bold uppercase tracking-wider border-b-2 transition-colors flex items-center justify-center gap-2 ${activeTab === 'a' ? 'border-primary-900 text-primary-900 bg-white' : 'border-transparent text-gray-400 hover:text-gray-600'}`}
                                >
                                    <Wallet size={16} /> Cash & Gold
                                </button>
                                <button
                                    onClick={() => setActiveTab('b')}
                                    className={`flex-1 py-4 text-sm font-bold uppercase tracking-wider border-b-2 transition-colors flex items-center justify-center gap-2 ${activeTab === 'b' ? 'border-primary-900 text-primary-900 bg-white' : 'border-transparent text-gray-400 hover:text-gray-600'}`}
                                >
                                    <TrendingUp size={16} /> Business
                                </button>
                                <button
                                    onClick={() => setActiveTab('c')}
                                    className={`flex-1 py-4 text-sm font-bold uppercase tracking-wider border-b-2 transition-colors flex items-center justify-center gap-2 ${activeTab === 'c' ? 'border-primary-900 text-primary-900 bg-white' : 'border-transparent text-gray-400 hover:text-gray-600'}`}
                                >
                                    <AlertTriangle size={16} /> Liabilities
                                </button>
                            </div>

                            <div className="p-6 md:p-8 min-h-[400px]">
                                <AnimatePresence mode="wait">
                                    {activeTab === 'a' && (
                                        <motion.div
                                            key="a"
                                            initial={{ opacity: 0, x: -10 }}
                                            animate={{ opacity: 1, x: 0 }}
                                            exit={{ opacity: 0, x: 10 }}
                                            className="space-y-6"
                                        >
                                            <h3 className="text-lg font-bold text-gray-800 flex items-center gap-2">
                                                <div className="w-8 h-8 rounded-full bg-blue-100 text-blue-600 flex items-center justify-center"><Wallet size={16} /></div>
                                                Cash Savings & Metals
                                            </h3>

                                            <div className="grid md:grid-cols-2 gap-6">
                                                <div>
                                                    <label className="block text-sm font-medium text-gray-700 mb-2">Cash in Hand</label>
                                                    <div className="relative">
                                                        <span className="absolute left-4 top-3.5 text-gray-400 font-bold">₦</span>
                                                        <CurrencyInput
                                                            value={assets.cashInHand}
                                                            onChange={(val) => handleAssetChange('cashInHand', val)}
                                                            className="w-full pl-10 pr-4 py-3 bg-gray-50 rounded-xl border border-gray-200 focus:border-blue-500 focus:ring-1 focus:ring-blue-500 outline-none"
                                                            placeholder="0.00"
                                                        />
                                                    </div>
                                                </div>
                                                <div>
                                                    <label className="block text-sm font-medium text-gray-700 mb-2">Cash in Bank</label>
                                                    <div className="relative">
                                                        <span className="absolute left-4 top-3.5 text-gray-400 font-bold">₦</span>
                                                        <CurrencyInput
                                                            value={assets.cashInBank}
                                                            onChange={(val) => handleAssetChange('cashInBank', val)}
                                                            className="w-full pl-10 pr-4 py-3 bg-gray-50 rounded-xl border border-gray-200 focus:border-blue-500 focus:ring-1 focus:ring-blue-500 outline-none"
                                                            placeholder="0.00"
                                                        />
                                                    </div>
                                                </div>
                                            </div>

                                            <div className="grid md:grid-cols-2 gap-6 pt-4 border-t border-gray-100">
                                                <div>
                                                    <div className="flex justify-between items-center mb-2">
                                                        <label className="block text-sm font-medium text-gray-700">Gold</label>
                                                        <button
                                                            onClick={() => setGoldMode(prev => prev === 'grams' ? 'value' : 'grams')}
                                                            className="text-[10px] uppercase font-bold tracking-wider text-gold-600 bg-gold-50 px-2 py-0.5 rounded hover:bg-gold-100 transition-colors flex items-center gap-1"
                                                        >
                                                            {goldMode === 'grams' ? <><Scale size={8} /> Grams</> : 'Value'}
                                                        </button>
                                                    </div>
                                                    <div className="relative">
                                                        {goldMode === 'value' && <span className="absolute left-4 top-3.5 text-gray-400 font-bold">₦</span>}
                                                        <CurrencyInput
                                                            value={assets.goldInput}
                                                            onChange={(val) => handleAssetChange('goldInput', val)}
                                                            className={`w-full ${goldMode === 'value' ? 'pl-10' : 'pl-4'} pr-4 py-3 bg-gray-50 rounded-xl border focus:ring-1 outline-none ${goldMode === 'grams' ? 'border-orange-200 focus:border-orange-500 focus:ring-orange-500' : 'border-gray-200 focus:border-gold-500 focus:ring-gold-500'}`}
                                                            placeholder={goldMode === 'grams' ? "Weight in Grams" : "0.00"}
                                                        />
                                                    </div>
                                                    {goldMode === 'grams' && parse(assets.goldInput) > 0 && (
                                                        <p className="text-xs text-gold-600 mt-1.5 flex items-center gap-1">
                                                            <Coins size={10} /> Value: {formatCurrency(parse(assets.goldInput) * (goldPrice || 0))}
                                                        </p>
                                                    )}
                                                    {goldMode === 'value' && (
                                                        <p className="text-xs text-gray-400 mt-1.5 flex items-center gap-1">
                                                            Rate: {formatCurrency(goldPrice || 0)}/g
                                                        </p>
                                                    )}
                                                </div>

                                                <div>
                                                    <div className="flex justify-between items-center mb-2">
                                                        <label className="block text-sm font-medium text-gray-700">Silver</label>
                                                        <button
                                                            onClick={() => setSilverMode(prev => prev === 'grams' ? 'value' : 'grams')}
                                                            className="text-[10px] uppercase font-bold tracking-wider text-gray-600 bg-gray-100 px-2 py-0.5 rounded hover:bg-gray-200 transition-colors flex items-center gap-1"
                                                        >
                                                            {silverMode === 'grams' ? <><Scale size={8} /> Grams</> : 'Value'}
                                                        </button>
                                                    </div>
                                                    <div className="relative">
                                                        {silverMode === 'value' && <span className="absolute left-4 top-3.5 text-gray-400 font-bold">₦</span>}
                                                        <CurrencyInput
                                                            value={assets.silverInput}
                                                            onChange={(val) => handleAssetChange('silverInput', val)}
                                                            className={`w-full ${silverMode === 'value' ? 'pl-10' : 'pl-4'} pr-4 py-3 bg-gray-50 rounded-xl border focus:ring-1 outline-none ${silverMode === 'grams' ? 'border-orange-200 focus:border-orange-500 focus:ring-orange-500' : 'border-gray-200 focus:border-gold-500 focus:ring-gold-500'}`}
                                                            placeholder={silverMode === 'grams' ? "Weight in Grams" : "0.00"}
                                                        />
                                                    </div>
                                                    {silverMode === 'grams' && parse(assets.silverInput) > 0 && (
                                                        <p className="text-xs text-gray-500 mt-1.5 flex items-center gap-1">
                                                            Value: {formatCurrency(parse(assets.silverInput) * (silverPrice || 0))}
                                                        </p>
                                                    )}
                                                </div>
                                            </div>
                                        </motion.div>
                                    )}

                                    {activeTab === 'b' && (
                                        <motion.div
                                            key="b"
                                            initial={{ opacity: 0, x: -10 }}
                                            animate={{ opacity: 1, x: 0 }}
                                            exit={{ opacity: 0, x: 10 }}
                                            className="space-y-6"
                                        >
                                            <h3 className="text-lg font-bold text-gray-800 flex items-center gap-2">
                                                <div className="w-8 h-8 rounded-full bg-purple-100 text-purple-600 flex items-center justify-center"><TrendingUp size={16} /></div>
                                                Business & Investments
                                            </h3>

                                            <div>
                                                <label className="block text-sm font-medium text-gray-700 mb-2">Value of Business Goods/Inventory</label>
                                                <div className="relative">
                                                    <span className="absolute left-4 top-3.5 text-gray-400 font-bold">₦</span>
                                                    <CurrencyInput
                                                        value={assets.businessGoods}
                                                        onChange={(val) => handleAssetChange('businessGoods', val)}
                                                        className="w-full pl-10 pr-4 py-3 bg-gray-50 rounded-xl border border-gray-200 focus:border-purple-500 focus:ring-1 focus:ring-purple-500 outline-none"
                                                        placeholder="0.00"
                                                    />
                                                </div>
                                                <p className="text-xs text-gray-500 mt-1">Current market value of goods for sale, not fixed assets (fixtures/machines).</p>
                                            </div>

                                            <div>
                                                <label className="block text-sm font-medium text-gray-700 mb-2">Shares & Investments</label>
                                                <div className="relative">
                                                    <span className="absolute left-4 top-3.5 text-gray-400 font-bold">₦</span>
                                                    <CurrencyInput
                                                        value={assets.investments}
                                                        onChange={(val) => handleAssetChange('investments', val)}
                                                        className="w-full pl-10 pr-4 py-3 bg-gray-50 rounded-xl border border-gray-200 focus:border-purple-500 focus:ring-1 focus:ring-purple-500 outline-none"
                                                        placeholder="0.00"
                                                    />
                                                </div>
                                            </div>

                                            <div>
                                                <label className="block text-sm font-medium text-gray-700 mb-2">Money Owed to You (Expected)</label>
                                                <div className="relative">
                                                    <span className="absolute left-4 top-3.5 text-gray-400 font-bold">₦</span>
                                                    <CurrencyInput
                                                        value={assets.moneyOwedToYou}
                                                        onChange={(val) => handleAssetChange('moneyOwedToYou', val)}
                                                        className="w-full pl-10 pr-4 py-3 bg-gray-50 rounded-xl border border-gray-200 focus:border-purple-500 focus:ring-1 focus:ring-purple-500 outline-none"
                                                        placeholder="0.00"
                                                    />
                                                </div>
                                            </div>
                                        </motion.div>
                                    )}

                                    {activeTab === 'c' && (
                                        <motion.div
                                            key="c"
                                            initial={{ opacity: 0, x: -10 }}
                                            animate={{ opacity: 1, x: 0 }}
                                            exit={{ opacity: 0, x: 10 }}
                                            className="space-y-6"
                                        >
                                            <h3 className="text-lg font-bold text-gray-800 flex items-center gap-2">
                                                <div className="w-8 h-8 rounded-full bg-red-100 text-red-600 flex items-center justify-center"><AlertTriangle size={16} /></div>
                                                Debts & Liabilities
                                            </h3>

                                            <div className="bg-red-50 p-4 rounded-xl border border-red-100 text-sm text-red-800 mb-6">
                                                Costs/Debts that are due immediately or within short term can be deducted from your total assets before Zakat calculation.
                                            </div>

                                            <div>
                                                <label className="block text-sm font-medium text-gray-700 mb-2">Debts Owed (To be repaid)</label>
                                                <div className="relative">
                                                    <span className="absolute left-4 top-3.5 text-gray-400 font-bold">₦</span>
                                                    <CurrencyInput
                                                        value={liabilities.debtsOwed}
                                                        onChange={(val) => handleLiabilityChange('debtsOwed', val)}
                                                        className="w-full pl-10 pr-4 py-3 bg-white rounded-xl border border-red-200 focus:border-red-500 focus:ring-1 focus:ring-red-500 outline-none"
                                                        placeholder="0.00"
                                                    />
                                                </div>
                                            </div>

                                            <div>
                                                <label className="block text-sm font-medium text-gray-700 mb-2">Immediate Expenses / Overheads</label>
                                                <div className="relative">
                                                    <span className="absolute left-4 top-3.5 text-gray-400 font-bold">₦</span>
                                                    <CurrencyInput
                                                        value={liabilities.expenses}
                                                        onChange={(val) => handleLiabilityChange('expenses', val)}
                                                        className="w-full pl-10 pr-4 py-3 bg-white rounded-xl border border-red-200 focus:border-red-500 focus:ring-1 focus:ring-red-500 outline-none"
                                                        placeholder="0.00"
                                                    />
                                                </div>
                                            </div>
                                        </motion.div>
                                    )}
                                </AnimatePresence>
                            </div>

                            <div className="bg-gray-50 border-t border-gray-100 p-6 flex justify-between">
                                <button
                                    onClick={() => setActiveTab(prev => prev === 'c' ? 'a' : prev === 'b' ? 'c' : 'b')}
                                    className="text-gray-500 font-bold text-sm hover:text-primary-900 transition-colors"
                                >
                                    {activeTab === 'c' ? 'Start Over' : 'Next Section'}
                                </button>
                                <div className="text-right">
                                    <div className="text-xs text-gray-500 uppercase tracking-wider font-bold mb-1">Total Assets</div>
                                    <div className="font-mono font-bold text-gray-900">{formatCurrency(totalAssets)}</div>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* RIGHT COLUMN: SUMMARY CARD */}
                    <div className="lg:w-96">
                        <div className="bg-primary-900 rounded-2xl p-6 text-white shadow-xl sticky top-24">
                            <h2 className="text-xl font-heading font-bold mb-6 flex items-center gap-2">
                                <Calculator size={20} className="text-gold-400" /> Assessment Summary
                            </h2>

                            <div className="space-y-4 mb-8">
                                <div className="flex justify-between items-center text-primary-200 text-sm">
                                    <span>Total Assets</span>
                                    <span>{formatCurrency(totalAssets)}</span>
                                </div>
                                <div className="flex justify-between items-center text-red-300 text-sm">
                                    <span>Total Liabilities</span>
                                    <span>- {formatCurrency(totalLiabilities)}</span>
                                </div>
                                <div className="h-px bg-white/10 my-2"></div>
                                <div className="flex justify-between items-center text-white font-bold">
                                    <span>Net Zakat Worth</span>
                                    <span>{formatCurrency(netZakatWorth)}</span>
                                </div>
                            </div>

                            <div className={`p-4 rounded-xl mb-6 border ${isEligible ? 'bg-gold-500/10 border-gold-500/30' : 'bg-white/5 border-white/10'}`}>
                                <div className="flex justify-between items-center mb-1">
                                    <span className="text-xs text-primary-200 uppercase tracking-widest">Nisab Threshold</span>
                                    <span className="text-xs font-mono text-gold-400">{formatCurrency(goldNisabValue)}</span>
                                </div>
                                <div className="w-full bg-black/20 h-1.5 rounded-full overflow-hidden mt-2">
                                    <div
                                        className={`h-full ${isEligible ? 'bg-gold-500' : 'bg-gray-500'} transition-all duration-1000`}
                                        style={{ width: `${Math.min((netZakatWorth / goldNisabValue) * 100, 100)}%` }}
                                    ></div>
                                </div>
                                <div className="text-right mt-1">
                                    <span className={`text-[10px] ${isEligible ? 'text-green-400' : 'text-gray-400'}`}>
                                        {isEligible ? 'Target Reached' : 'Below Threshold'}
                                    </span>
                                </div>
                            </div>

                            <div className="text-center mb-6">
                                <div className="text-primary-200 text-xs uppercase tracking-wider mb-2">Total Zakat Payable</div>
                                <div className="text-4xl font-bold text-gold-400 font-heading">
                                    {formatCurrency(zakatPayable)}
                                </div>
                            </div>

                            {isEligible ? (
                                <a
                                    href={PAYSTACK_URL}
                                    target="_blank"
                                    rel="noreferrer"
                                    className="block w-full py-4 bg-gold-500 text-primary-900 font-bold rounded-xl text-center hover:bg-gold-400 transition-all shadow-lg hover:shadow-gold-500/20 transform hover:-translate-y-1"
                                >
                                    Pay Zakat Now
                                </a>
                            ) : (
                                <button disabled className="block w-full py-4 bg-white/10 text-gray-400 font-bold rounded-xl text-center cursor-not-allowed">
                                    Not Eligible
                                </button>
                            )}

                            <p className="text-center text-[10px] text-primary-400 mt-4">
                                *Calculations based on Gold Nisab (85g) at current rates as of {loading ? '...' : lastUpdated}.
                            </p>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default ZakatPage;
