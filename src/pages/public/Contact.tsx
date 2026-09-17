import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { MapPin, Phone, Mail, Send, CheckCircle } from 'lucide-react';
import SEO from '../../components/common/SEO';
import { useAnimations } from '../../hooks/useAnimations';
import { supabase } from '../../lib/supabase';
import { callEdgeFunction } from '../../lib/edgeFunctions';
import { useSiteSettings } from '../../context/SiteSettingsContext';

const Contact: React.FC = () => {
    const { slideInLeft, slideInRight, fadeInUp, scaleIn, staggerContainer } = useAnimations();
    const { settings } = useSiteSettings();
    const [formData, setFormData] = useState({
        name: '',
        email: '',
        subject: '',
        message: ''
    });
    const [status, setStatus] = useState<'idle' | 'submitting' | 'success' | 'error'>('idle');

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setStatus('submitting');

        try {
            const { error } = await supabase.from('contacts').insert({
                name: formData.name,
                email: formData.email,
                subject: formData.subject,
                message: formData.message,
                read: false,
            });

            if (error) throw error;

            // Fire-and-forget email notification to admin
            callEdgeFunction('notify-application', {
                type: 'contact',
                record: {
                    name: formData.name,
                    email: formData.email,
                    subject: formData.subject,
                    message: formData.message,
                },
            });

            setStatus('success');
            setFormData({ name: '', email: '', subject: '', message: '' });
        } catch (error) {
            console.error("Error sending message:", error);
            setStatus('error');
        }
    };

    return (
        <div className="min-h-screen bg-gray-50">
            <SEO
                title="Contact Us"
                description="Get in touch with Al-Ihsan Relief. Visit us in Lagos, call, or send a message."
            />

            {/* Hero Header */}
            <section className="bg-primary-950 py-20 px-6 text-center relative overflow-hidden">
                <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/stardust.png')] opacity-10"></div>
                <div className="relative z-10">
                    <motion.h1
                        variants={slideInLeft}
                        initial="hidden"
                        animate="visible"
                        className="text-4xl md:text-5xl font-heading font-bold text-white mb-4"
                    >
                        Get in Touch
                    </motion.h1>
                    <motion.p
                        variants={fadeInUp}
                        initial="hidden"
                        animate="visible"
                        className="text-primary-200 text-lg max-w-xl mx-auto"
                    >
                        Have a question, suggestion, or want to volunteer? We'd love to hear from you.
                    </motion.p>
                </div>
            </section>

            <div className="container mx-auto px-6 py-12 md:py-20 -mt-10 relative z-20">
                <div className="grid lg:grid-cols-2 gap-12 items-start">
                    {/* Contact Info Side */}
                    <motion.div
                        initial="hidden"
                        whileInView="visible"
                        viewport={{ once: true }}
                        variants={staggerContainer}
                        className="space-y-8"
                    >
                        {/* Info Cards */}
                        <motion.div variants={fadeInUp} className="bg-white p-8 rounded-2xl shadow-lg flex flex-col items-center md:flex-row md:items-start gap-4 text-center md:text-left">
                            <div className="w-12 h-12 bg-gold-100 text-gold-600 rounded-full flex items-center justify-center shrink-0">
                                <MapPin size={24} />
                            </div>
                            <div>
                                <h3 className="font-bold text-lg text-primary-900 mb-1">Our Headquarters</h3>
                                <p className="text-gray-600 whitespace-pre-line">{settings.address}</p>
                            </div>
                        </motion.div>

                        <motion.div variants={fadeInUp} className="bg-white p-8 rounded-2xl shadow-lg flex flex-col items-center md:flex-row md:items-start gap-4 text-center md:text-left">
                            <div className="w-12 h-12 bg-blue-100 text-blue-600 rounded-full flex items-center justify-center shrink-0">
                                <Phone size={24} />
                            </div>
                            <div>
                                <h3 className="font-bold text-lg text-primary-900 mb-1">Phone & WhatsApp</h3>
                                <p className="text-gray-600">{settings.phonePrimary}</p>
                                {settings.phoneSecondary && <p className="text-gray-600">{settings.phoneSecondary}</p>}
                                <p className="text-gray-500 text-sm mt-1">Available Mon-Sat, 9am - 5pm</p>
                            </div>
                        </motion.div>

                        <motion.div variants={fadeInUp} className="bg-white p-8 rounded-2xl shadow-lg flex flex-col items-center md:flex-row md:items-start gap-4 text-center md:text-left">
                            <div className="w-12 h-12 bg-green-100 text-green-600 rounded-full flex items-center justify-center shrink-0">
                                <Mail size={24} />
                            </div>
                            <div>
                                <h3 className="font-bold text-lg text-primary-900 mb-1">Email Us</h3>
                                <p className="text-gray-600">{settings.emailInfo}</p>
                                {settings.emailSupport && <p className="text-gray-600">{settings.emailSupport}</p>}
                            </div>
                        </motion.div>

                        {/* Map Placeholder */}
                        <motion.div variants={scaleIn} className="w-full h-64 bg-gray-200 rounded-2xl overflow-hidden shadow-inner relative">
                            <iframe
                                title="Map Location"
                                src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d253682.45932650057!2d3.1438722!3d6.5481154!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x103b8b2ae68280c1%3A0xdc9e87a36715d!2sLagos!5e0!3m2!1sen!2sng!4v1680000000000!5m2!1sen!2sng"
                                width="100%"
                                height="100%"
                                style={{ border: 0 }}
                                loading="lazy"
                                className="opacity-80 hover:opacity-100 transition-opacity"
                            ></iframe>
                        </motion.div>
                    </motion.div>

                    {/* Contact Form Side */}
                    <motion.div
                        initial="hidden"
                        whileInView="visible"
                        viewport={{ once: true }}
                        variants={slideInRight}
                    >
                        <div className="bg-white p-8 md:p-10 rounded-2xl shadow-xl border border-gray-100">
                            <AnimatePresence mode="wait">
                                {status === 'success' ? (
                                    <motion.div
                                        key="success"
                                        initial={{ opacity: 0, scale: 0.9 }}
                                        animate={{ opacity: 1, scale: 1 }}
                                        className="text-center py-10"
                                    >
                                        <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6">
                                            <CheckCircle size={40} className="text-green-600" />
                                        </div>
                                        <h3 className="text-2xl font-bold text-primary-900 mb-2">Message Sent!</h3>
                                        <p className="text-gray-600 mb-8">JazakAllahu Khairan. We have received your message and will get back to you soon.</p>
                                        <button
                                            onClick={() => setStatus('idle')}
                                            className="px-6 py-2 border border-gray-300 rounded-full text-gray-600 hover:bg-gray-50"
                                        >
                                            Send Another Message
                                        </button>
                                    </motion.div>
                                ) : (
                                    <motion.form
                                        key="form"
                                        initial={{ opacity: 0 }}
                                        animate={{ opacity: 1 }}
                                        exit={{ opacity: 0 }}
                                        className="space-y-6"
                                        onSubmit={handleSubmit}
                                    >
                                        <h2 className="text-2xl font-bold text-primary-900 mb-6">Send a Message</h2>

                                        <div className="grid md:grid-cols-2 gap-6">
                                            <div>
                                                <label className="block text-sm font-bold text-primary-900 mb-2">Your Name</label>
                                                <input required name="name" value={formData.name} onChange={handleChange} type="text" className="w-full px-4 py-3 rounded-lg bg-gray-50 border border-gray-200 focus:bg-white focus:border-gold-500 focus:ring-2 focus:ring-gold-500/20 outline-none transition-all" placeholder="John Doe" />
                                            </div>
                                            <div>
                                                <label className="block text-sm font-bold text-primary-900 mb-2">Email Address</label>
                                                <input required name="email" value={formData.email} onChange={handleChange} type="email" className="w-full px-4 py-3 rounded-lg bg-gray-50 border border-gray-200 focus:bg-white focus:border-gold-500 focus:ring-2 focus:ring-gold-500/20 outline-none transition-all" placeholder="john@example.com" />
                                            </div>
                                        </div>

                                        <div>
                                            <label className="block text-sm font-bold text-primary-900 mb-2">Subject</label>
                                            <input required name="subject" value={formData.subject} onChange={handleChange} type="text" className="w-full px-4 py-3 rounded-lg bg-gray-50 border border-gray-200 focus:bg-white focus:border-gold-500 focus:ring-2 focus:ring-gold-500/20 outline-none transition-all" placeholder="How can we help?" />
                                        </div>

                                        <div>
                                            <label className="block text-sm font-bold text-primary-900 mb-2">Message</label>
                                            <textarea required name="message" value={formData.message} onChange={handleChange} rows={5} className="w-full px-4 py-3 rounded-lg bg-gray-50 border border-gray-200 focus:bg-white focus:border-gold-500 focus:ring-2 focus:ring-gold-500/20 outline-none transition-all resize-none" placeholder="Write your message here..."></textarea>
                                        </div>

                                        <button
                                            type="submit"
                                            disabled={status === 'submitting'}
                                            className="w-full py-4 bg-primary-900 text-white font-bold rounded-xl hover:bg-primary-800 transition-all flex items-center justify-center gap-2 shadow-lg disabled:opacity-70 disabled:cursor-not-allowed group"
                                        >
                                            {status === 'submitting' ? 'Sending...' : (
                                                <>Send Message <Send size={18} className="group-hover:translate-x-1 transition-transform" /></>
                                            )}
                                        </button>

                                        {status === 'error' && (
                                            <p className="text-red-500 text-sm text-center mt-4">Something went wrong. Please try again later.</p>
                                        )}
                                    </motion.form>
                                )}
                            </AnimatePresence>
                        </div>
                    </motion.div>
                </div>
            </div>
        </div>
    );
};

export default Contact;
