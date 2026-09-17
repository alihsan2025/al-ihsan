import React from 'react';
import { Link } from 'react-router-dom';
import { Facebook, Instagram, Phone, Mail, ArrowRight, Twitter, Linkedin, Music } from 'lucide-react';
import { useSiteSettings } from '../../context/SiteSettingsContext';

const Footer: React.FC = () => {
    const { settings } = useSiteSettings();
    return (
        <footer className="bg-primary-900 border-t-4 border-gold-500 text-white pt-20 pb-10 mt-auto relative overflow-hidden">
            {/* Background Pattern */}
            <div className="absolute top-0 left-0 w-full h-full opacity-5 pointer-events-none">
                <div className="absolute top-[-10%] right-[-5%] w-96 h-96 bg-gold-500 rounded-full blur-[100px]"></div>
                <div className="absolute bottom-[-10%] left-[-5%] w-96 h-96 bg-primary-600 rounded-full blur-[100px]"></div>
            </div>

            <div className="container mx-auto px-6 relative z-10">
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-12 mb-16">
                    <div className="space-y-6 flex flex-col items-center md:items-start text-center md:text-left">
                        <div className="flex items-center gap-3">
                            <img src="/logo.jpeg" alt="Al-Ihsan Logo" className="w-12 h-12 rounded-full border-2 border-gold-500" />
                            <div>
                                <h3 className="text-2xl font-heading font-bold text-white tracking-wide">Al-Ihsan</h3>
                                <p className="text-gold-400 text-xs font-bold tracking-widest uppercase">Relief & Empowerment</p>
                            </div>
                        </div>
                        <p className="text-primary-100/80 text-sm leading-relaxed max-w-xs border-t-2 pt-4 md:border-t-0 md:pt-0 md:border-l-2 border-gold-500/30 md:pl-4 whitespace-pre-line">
                            {settings.aboutText}
                        </p>
                    </div>

                    <div className="space-y-6 flex flex-col items-center md:items-start text-center md:text-left">
                        <h4 className="text-lg font-bold text-gold-400 font-heading">Quick Links</h4>
                        <ul className="space-y-3 w-full flex flex-col items-center md:items-start">
                            {[
                                { to: "/", label: "Home" },
                                { to: "/about", label: "About Us" },
                                { to: "/focus", label: "Our Programs" },
                                { to: "/gallery", label: "Gallery" },
                                { to: "/request-help", label: "Get Help" },
                                { to: "/apply", label: "Volunteer" }
                            ].map(link => (
                                <li key={link.to} className="w-full md:w-auto">
                                    <Link to={link.to} className="text-primary-200 hover:text-gold-400 transition-colors text-sm flex items-center justify-center md:justify-start gap-2 group">
                                        <ArrowRight size={12} className="opacity-0 group-hover:opacity-100 -translate-x-2 group-hover:translate-x-0 transition-all text-gold-500 hidden md:block" />
                                        {link.label}
                                    </Link>
                                </li>
                            ))}
                        </ul>
                    </div>

                    <div className="space-y-6 flex flex-col items-center md:items-start text-center md:text-left">
                        <h4 className="text-lg font-bold text-gold-400 font-heading">Contact Us</h4>
                        <ul className="space-y-0 md:space-y-4 text-sm text-primary-100/80 w-full flex flex-row justify-center md:justify-start gap-8 md:gap-0 md:flex-col md:items-start">
                            <li className="flex flex-col md:flex-row items-center md:items-start gap-2 md:gap-4 group">
                                <div className="p-2 bg-white/5 rounded-lg text-gold-400 group-hover:bg-gold-500 group-hover:text-white transition-colors">
                                    <Phone size={18} />
                                </div>
                                <div className="flex flex-col mt-1 text-center md:text-left">
                                    <a href={`tel:${settings.phonePrimary}`} className="hover:text-gold-300 transition-colors">{settings.phonePrimary}</a>
                                    {settings.phoneSecondary && (
                                        <a href={`tel:${settings.phoneSecondary}`} className="hover:text-gold-300 transition-colors">{settings.phoneSecondary}</a>
                                    )}
                                </div>
                            </li>
                            <li className="flex flex-col md:flex-row items-center md:items-start gap-2 md:gap-4 group">
                                <div className="p-2 bg-white/5 rounded-lg text-gold-400 group-hover:bg-gold-500 group-hover:text-white transition-colors">
                                    <Mail size={18} />
                                </div>
                                <div className="flex flex-col mt-1 text-center md:text-left">
                                    <a href={`mailto:${settings.emailInfo}`} className="hover:text-gold-300 transition-colors">{settings.emailInfo}</a>
                                    {settings.emailSupport && (
                                        <a href={`mailto:${settings.emailSupport}`} className="hover:text-gold-300 transition-colors">{settings.emailSupport}</a>
                                    )}
                                </div>
                            </li>
                        </ul>
                    </div>

                    <div className="space-y-6 flex flex-col items-center md:items-start text-center md:text-left">
                        <h4 className="text-lg font-bold text-gold-400 font-heading">Connect</h4>
                        <p className="text-primary-200/60 text-sm">Follow our journey and see the impact of your charity.</p>
                        <div className="flex flex-wrap gap-4 justify-center md:justify-start">
                            {settings.facebookUrl && (
                                <a href={settings.facebookUrl} target="_blank" rel="noreferrer" className="bg-white/10 p-3 rounded-full hover:bg-gold-500 transition-all hover:-translate-y-1 text-white shadow-lg group">
                                    <Facebook size={20} className="group-hover:scale-110 transition-transform" />
                                </a>
                            )}
                            {settings.instagramUrl && (
                                <a href={settings.instagramUrl} target="_blank" rel="noreferrer" className="bg-white/10 p-3 rounded-full hover:bg-gold-500 transition-all hover:-translate-y-1 text-white shadow-lg group">
                                    <Instagram size={20} className="group-hover:scale-110 transition-transform" />
                                </a>
                            )}
                            {settings.twitterUrl && (
                                <a href={settings.twitterUrl} target="_blank" rel="noreferrer" className="bg-white/10 p-3 rounded-full hover:bg-gold-500 transition-all hover:-translate-y-1 text-white shadow-lg group">
                                    <Twitter size={20} className="group-hover:scale-110 transition-transform" />
                                </a>
                            )}
                            {settings.linkedinUrl && (
                                <a href={settings.linkedinUrl} target="_blank" rel="noreferrer" className="bg-white/10 p-3 rounded-full hover:bg-gold-500 transition-all hover:-translate-y-1 text-white shadow-lg group">
                                    <Linkedin size={20} className="group-hover:scale-110 transition-transform" />
                                </a>
                            )}
                            {settings.tiktokUrl && (
                                <a href={settings.tiktokUrl} target="_blank" rel="noreferrer" className="bg-white/10 p-3 rounded-full hover:bg-gold-500 transition-all hover:-translate-y-1 text-white shadow-lg group">
                                    <Music size={20} className="group-hover:scale-110 transition-transform" />
                                </a>
                            )}
                        </div>
                    </div>
                </div>

                <div className="border-t border-white/10 pt-8 flex flex-col md:flex-row justify-between items-center text-center md:text-left gap-4">
                    <p className="text-primary-300/60 text-xs text-center w-full md:w-auto">
                        &copy; {new Date().getFullYear()} Al-Ihsan Relief and Empowerment. All rights reserved.
                    </p>
                </div>
            </div>
        </footer>
    );
};

export default Footer;
