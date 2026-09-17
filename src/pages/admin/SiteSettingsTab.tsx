import React, { useState, useEffect } from 'react';
import { useSiteSettings } from '../../context/SiteSettingsContext';
import { updateSiteSettings } from '../../lib/siteSettingsService';
import { Save, AlertCircle, CheckCircle } from 'lucide-react';

const inputClass =
    'w-full px-3 py-2 bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-700 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500 outline-none transition-shadow text-sm text-slate-900 dark:text-white placeholder:text-slate-400';

const labelClass = 'block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1.5 tracking-tight';

const SiteSettingsTab: React.FC = () => {
    const { settings, refreshSettings } = useSiteSettings();
    const [formData, setFormData] = useState(settings);
    const [isSaving, setIsSaving] = useState(false);
    const [message, setMessage] = useState<{ text: string; type: 'success' | 'error' } | null>(null);

    // Sync form data if settings load late
    useEffect(() => {
        setFormData(settings);
    }, [settings]);

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
        setFormData(prev => ({
            ...prev,
            [e.target.name]: e.target.value
        }));
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setMessage(null);
        setIsSaving(true);

        try {
            await updateSiteSettings(formData);
            await refreshSettings();
            setMessage({ text: 'Site settings updated successfully!', type: 'success' });
            setTimeout(() => setMessage(null), 3000);
        } catch (error: any) {
            console.error('Failed to update settings:', error);
            setMessage({ text: error.message || 'Failed to update settings.', type: 'error' });
        } finally {
            setIsSaving(false);
        }
    };

    return (
        <div className="bg-white dark:bg-[#111827] rounded-xl shadow-sm border border-slate-200 dark:border-white/10 overflow-hidden">
            <div className="p-6 border-b border-slate-100 dark:border-white/10 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                    <h2 className="text-xl font-bold text-slate-900 dark:text-white">Site Settings</h2>
                    <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">
                        Update global information like contacts, social links, and bank details.
                    </p>
                </div>
            </div>

            <form onSubmit={handleSubmit} className="p-6 space-y-8">
                {message && (
                    <div className={`p-4 rounded-xl flex items-center gap-3 ${
                        message.type === 'success'
                            ? 'bg-emerald-50 dark:bg-emerald-500/10 text-emerald-700 dark:text-emerald-400 border border-emerald-200 dark:border-emerald-500/20'
                            : 'bg-red-50 dark:bg-red-500/10 text-red-700 dark:text-red-400 border border-red-200 dark:border-red-500/20'
                    }`}>
                        {message.type === 'success' ? <CheckCircle size={20} /> : <AlertCircle size={20} />}
                        <p className="font-medium text-sm">{message.text}</p>
                    </div>
                )}

                <div className="grid lg:grid-cols-2 gap-8">
                    {/* General & Contact Section */}
                    <div className="space-y-6">
                        <h3 className="text-base font-bold text-slate-900 dark:text-white border-b border-slate-200 dark:border-white/10 pb-2">General & Contact Info</h3>

                        <div>
                            <label className={labelClass}>Footer About Text</label>
                            <textarea
                                name="aboutText"
                                value={formData.aboutText}
                                onChange={handleChange}
                                rows={3}
                                className={inputClass}
                            />
                        </div>

                        <div>
                            <label className={labelClass}>Headquarters Address</label>
                            <textarea
                                name="address"
                                value={formData.address}
                                onChange={handleChange}
                                rows={2}
                                className={inputClass}
                            />
                        </div>

                        <div className="grid grid-cols-2 gap-4">
                            <div>
                                <label className={labelClass}>Primary Phone</label>
                                <input
                                    type="text"
                                    name="phonePrimary"
                                    value={formData.phonePrimary}
                                    onChange={handleChange}
                                    className={inputClass}
                                />
                            </div>
                            <div>
                                <label className={labelClass}>Secondary Phone</label>
                                <input
                                    type="text"
                                    name="phoneSecondary"
                                    value={formData.phoneSecondary || ''}
                                    onChange={handleChange}
                                    className={inputClass}
                                />
                            </div>
                        </div>

                        <div className="grid grid-cols-2 gap-4">
                            <div>
                                <label className={labelClass}>Primary Email</label>
                                <input
                                    type="email"
                                    name="emailInfo"
                                    value={formData.emailInfo}
                                    onChange={handleChange}
                                    className={inputClass}
                                />
                            </div>
                            <div>
                                <label className={labelClass}>Support Email</label>
                                <input
                                    type="email"
                                    name="emailSupport"
                                    value={formData.emailSupport || ''}
                                    onChange={handleChange}
                                    className={inputClass}
                                />
                            </div>
                        </div>
                    </div>

                    <div className="space-y-8">
                        {/* Dynamic Links */}
                        <div className="space-y-6">
                            <h3 className="text-base font-bold text-slate-900 dark:text-white border-b border-slate-200 dark:border-white/10 pb-2">Social Links</h3>

                            {['facebookUrl', 'instagramUrl', 'twitterUrl', 'linkedinUrl', 'tiktokUrl'].map((field) => (
                                <div key={field}>
                                    <label className={labelClass + ' capitalize'}>
                                        {field.replace('Url', '')} Link
                                    </label>
                                    <input
                                        type="url"
                                        name={field}
                                        value={(formData as any)[field] || ''}
                                        onChange={handleChange}
                                        className={inputClass}
                                        placeholder={`https://${field.replace('Url', '')}.com/...`}
                                    />
                                </div>
                            ))}
                        </div>

                        {/* Bank Details */}
                        <div className="space-y-6">
                            <h3 className="text-base font-bold text-slate-900 dark:text-white border-b border-slate-200 dark:border-white/10 pb-2">Donation Bank Account</h3>

                            <div>
                                <label className={labelClass}>Bank Name</label>
                                <input
                                    type="text"
                                    name="bankName"
                                    value={formData.bankName}
                                    onChange={handleChange}
                                    className={inputClass}
                                />
                            </div>
                            <div>
                                <label className={labelClass}>Account Name</label>
                                <input
                                    type="text"
                                    name="accountName"
                                    value={formData.accountName}
                                    onChange={handleChange}
                                    className={inputClass}
                                />
                            </div>
                            <div>
                                <label className={labelClass}>Account Number</label>
                                <input
                                    type="text"
                                    name="accountNumber"
                                    value={formData.accountNumber}
                                    onChange={handleChange}
                                    className={inputClass}
                                />
                            </div>
                        </div>
                    </div>
                </div>

                <div className="pt-6 border-t border-slate-200 dark:border-white/10 flex justify-end">
                    <button
                        type="submit"
                        disabled={isSaving}
                        className="flex items-center gap-2 px-6 py-2.5 bg-primary-600 dark:bg-primary-500 text-white rounded-lg font-medium text-sm hover:bg-primary-700 dark:hover:bg-primary-600 transition-colors disabled:opacity-70 shadow-sm"
                    >
                        <Save size={16} />
                        {isSaving ? 'Saving...' : 'Save Site Settings'}
                    </button>
                </div>
            </form>
        </div>
    );
};

export default SiteSettingsTab;
