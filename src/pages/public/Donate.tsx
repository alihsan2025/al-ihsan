import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Copy, CheckCircle, CreditCard, Wallet } from 'lucide-react';
import SEO from '../../components/common/SEO';
import { useAnimations } from '../../hooks/useAnimations';
import { useSiteSettings } from '../../context/SiteSettingsContext';

const Donate: React.FC = () => {
    const { slideInLeft, slideInRight, fadeInUp, staggerContainer } = useAnimations();
    const { settings } = useSiteSettings();
    const [copied, setCopied] = useState(false);

    const handleCopy = () => {
        navigator.clipboard.writeText(settings.accountNumber);
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
    };

    return (
        <div className="bg-gray-50 min-h-screen pt-12 pb-20">
            <SEO
                title="Donate"
                description="Make a difference today. Donate to Al-Ihsan Relief via bank transfer or Paystack to support orphans, providing food and education."
            />
            <div className="container mx-auto px-4 max-w-4xl">
                <motion.div
                    initial="hidden"
                    animate="visible"
                    variants={staggerContainer}
                    className="text-center mb-12"
                >
                    <motion.h1 variants={fadeInUp} className="text-4xl md:text-5xl font-heading font-bold text-primary-900 mb-4">Make a Difference Today</motion.h1>
                    <motion.p variants={fadeInUp} className="text-lg text-gray-600 max-w-2xl mx-auto">
                        Your Sadaqah and Zakat have the power to transform lives. Every donation is an Amanah that we deliver with excellence.
                    </motion.p>
                </motion.div>

                <div className="grid md:grid-cols-2 gap-8">
                    {/* Bank Transfer Card */}
                    <motion.div
                        initial="hidden"
                        animate="visible"
                        variants={slideInLeft}
                        className="bg-white rounded-2xl shadow-xl overflow-hidden border border-gray-100"
                    >
                        <div className="bg-primary-900 p-6 text-white text-center">
                            <Wallet className="mx-auto mb-3 text-gold-400" size={40} />
                            <h2 className="text-2xl font-bold">Bank Transfer</h2>
                            <p className="text-primary-200 text-sm">Direct transfer to our official account</p>
                        </div>
                        <div className="p-8 space-y-6">
                            <div className="text-center p-4 bg-gray-50 rounded-xl border border-gray-100">
                                <p className="text-sm text-gray-500 mb-1">Bank Name</p>
                                <p className="text-xl font-bold text-gray-900">{settings.bankName}</p>
                            </div>
                            <div className="text-center p-4 bg-gray-50 rounded-xl border border-gray-100">
                                <p className="text-sm text-gray-500 mb-1">Account Name</p>
                                <p className="text-lg font-bold text-gray-900">{settings.accountName}</p>
                            </div>
                            <div className="text-center p-4 bg-gold-50 rounded-xl border border-gold-100 relative group cursor-pointer" onClick={handleCopy}>
                                <p className="text-sm text-gold-700 mb-1">Account Number</p>
                                <div className="flex items-center justify-center gap-3">
                                    <p className="text-3xl font-bold text-primary-900 tracking-wider">{settings.accountNumber}</p>
                                    <button className="text-gold-600 hover:text-gold-700 transition-colors">
                                        {copied ? <CheckCircle size={20} /> : <Copy size={20} />}
                                    </button>
                                </div>
                                <span className="absolute bottom-2 right-1/2 translate-x-1/2 text-xs text-gold-600 opacity-0 group-hover:opacity-100 transition-opacity">Click to copy</span>
                            </div>
                        </div>
                    </motion.div>

                    {/* Online Payment Card */}
                    <motion.div
                        initial="hidden"
                        animate="visible"
                        variants={slideInRight}
                        className="bg-white rounded-2xl shadow-xl overflow-hidden border border-gray-100 flex flex-col"
                    >
                        <div className="bg-gold-500 p-6 text-white text-center">
                            <CreditCard className="mx-auto mb-3 text-white" size={40} />
                            <h2 className="text-2xl font-bold">Paystack / Card</h2>
                            <p className="text-white/80 text-sm">Secure online payment</p>
                        </div>
                        <div className="p-8 flex-1 flex flex-col justify-center space-y-6">
                            <p className="text-gray-600 text-center">
                                Donate securely using your Debit Card, USSD, or Bank Transfer via Paystack.
                            </p>

                            <div className="space-y-4">
                                <label className="block text-sm font-medium text-gray-700 text-center">Select Amount (NGN)</label>
                                <div className="grid grid-cols-3 gap-3">
                                    {['1000', '5000', '10000'].map((amt) => (
                                        <button key={amt} className="py-2 border border-primary-200 rounded-full text-primary-700 hover:bg-primary-50 font-medium transition-colors">
                                            ₦{amt}
                                        </button>
                                    ))}
                                </div>
                                <input
                                    type="number"
                                    placeholder="Enter custom amount"
                                    className="w-full px-4 py-3 rounded-xl border border-gray-300 focus:ring-2 focus:ring-gold-500 focus:border-transparent outline-none transition-shadow"
                                />
                            </div>

                            <button className="w-full py-3 bg-primary-900 text-white font-bold rounded-full shadow-lg hover:bg-primary-800 transition-all transform hover:-translate-y-0.5">
                                Donate via Paystack
                            </button>
                        </div>
                    </motion.div>
                </div>
            </div>
        </div>
    );
};

export default Donate;
