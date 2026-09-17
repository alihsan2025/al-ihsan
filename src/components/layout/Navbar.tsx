import React, { useState, useEffect, useRef } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Menu, X, Heart } from 'lucide-react';

const Navbar: React.FC = () => {
    const [isOpen, setIsOpen] = useState(false);
    const location = useLocation();
    const menuRef = useRef<HTMLDivElement>(null);
    const buttonRef = useRef<HTMLButtonElement>(null);

    // Close menu when clicking outside
    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (
                isOpen &&
                menuRef.current &&
                !menuRef.current.contains(event.target as Node) &&
                buttonRef.current &&
                !buttonRef.current.contains(event.target as Node)
            ) {
                setIsOpen(false);
            }
        };

        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, [isOpen]);

    const navLinks = [
        { name: 'Home', path: '/' },
        { name: 'About', path: '/about' },
        { name: 'Programs', path: '/focus' },
        { name: 'Gallery', path: '/gallery' },
        { name: 'Get Help', path: '/request-help' },
        { name: 'Volunteer', path: '/apply' },
        { name: 'Contact', path: '/contact' },
    ];

    const isActive = (path: string) => location.pathname === path;

    return (
        <nav className="fixed top-0 left-0 right-0 z-50 bg-primary-950 border-b border-white/10 shadow-xl h-20 transition-all duration-300">
            <div className="container mx-auto px-6 h-full flex justify-between items-center relative">
                {/* Logo (Left) */}
                <div className="flex items-center gap-3 z-20">
                    <Link to="/" className="relative group shrink-0">
                        <div className="absolute inset-0 bg-gold-400 rounded-full blur-md opacity-20 group-hover:opacity-50 transition-opacity duration-500"></div>
                        <img
                            src="/logo.jpeg"
                            alt="Al-Ihsan Logo"
                            className="h-10 w-10 relative z-10 rounded-full object-cover border-2 border-gold-500 shadow-lg"
                        />
                    </Link>
                    <Link to="/" className="hidden lg:block">
                        <span className="text-lg xl:text-xl font-heading font-bold text-white tracking-wide whitespace-nowrap">
                            Al-Ihsan Relief And Empowerment<span className="text-gold-400">.</span>
                        </span>
                    </Link>
                </div>

                {/* Mobile Title (Center) */}
                <Link to="/" className="lg:hidden absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 w-[50%] xs:w-[60%] sm:w-[65%] text-center z-10">
                    <span className="text-[13px] sm:text-[15px] md:text-lg font-heading font-bold text-white leading-tight block">
                        Al-Ihsan Relief And Empowerment<span className="text-gold-400">.</span>
                    </span>
                </Link>

                {/* Desktop Menu (Absolute Center) */}
                <div className="hidden md:flex absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2">
                    <ul className="flex items-center gap-1 bg-white/5 px-2 py-1.5 rounded-full border border-white/5 backdrop-blur-sm">
                        {navLinks.map((link) => (
                            <li key={link.name}>
                                <Link
                                    to={link.path}
                                    className={`px-4 py-1.5 rounded-full text-sm font-medium transition-all duration-300 ${isActive(link.path)
                                        ? 'text-primary-900 bg-gold-400 font-bold shadow-sm'
                                        : 'text-gray-300 hover:text-white hover:bg-white/10'
                                        }`}
                                >
                                    {link.name}
                                </Link>
                            </li>
                        ))}
                    </ul>
                </div>

                {/* Donate Button (Right) */}
                <div className="hidden md:flex items-center z-20">
                    <Link
                        to="/donate"
                        className="px-5 py-2 bg-gold-500 text-primary-950 font-bold rounded-full shadow-lg hover:bg-gold-400 transition-all flex items-center gap-2 text-sm"
                    >
                        Donate <Heart size={14} fill="currentColor" />
                    </Link>
                </div>

                {/* Mobile Toggle */}
                <button
                    ref={buttonRef}
                    className="md:hidden text-white hover:text-gold-400 transition-colors p-2 z-20"
                    onClick={() => setIsOpen(!isOpen)}
                >
                    {isOpen ? <X size={24} /> : <Menu size={24} />}
                </button>

                {/* Mobile Menu (Small Card) */}
                {isOpen && (
                    <div
                        ref={menuRef}
                        className="absolute top-[85%] right-4 w-64 bg-white rounded-xl shadow-2xl border border-gray-100 p-2 flex flex-col gap-1 z-50 animate-in fade-in slide-in-from-top-2 duration-200"
                    >
                        {navLinks.map((link) => (
                            <Link
                                key={link.name}
                                to={link.path}
                                className={`block px-4 py-3 rounded-lg text-sm font-medium transition-colors text-center ${isActive(link.path)
                                    ? 'bg-primary-50 text-primary-900 font-bold'
                                    : 'text-gray-600 hover:bg-gray-50 hover:text-primary-900'
                                    }`}
                                onClick={() => setIsOpen(false)}
                            >
                                {link.name}
                            </Link>
                        ))}
                        <div className="h-px bg-gray-100 my-1"></div>
                        <Link
                            to="/donate"
                            onClick={() => setIsOpen(false)}
                            className="w-full flex items-center justify-center gap-2 py-3 bg-primary-900 text-gold-400 font-bold rounded-full text-sm hover:bg-primary-800 transition-colors"
                        >
                            Donate Now <Heart size={14} fill="currentColor" />
                        </Link>
                    </div>
                )}
            </div>
        </nav>
    );
};

export default Navbar;
