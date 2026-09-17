import React from 'react';
import { Link } from 'react-router-dom';
import { ArrowRight, Heart, Users, ShieldCheck, Building2, Users2, Eye } from 'lucide-react';
import { motion } from 'framer-motion';

import SEO from '../../components/common/SEO';
import CountUp from '../../components/common/CountUp';
import ImpactPieChart from '../../components/home/ImpactPieChart';
import UrgentAppealCard from '../../components/home/UrgentAppealCard';
import ZakatCalculator from '../../components/home/ZakatCalculator';
import FloatingWhatsApp from '../../components/common/FloatingWhatsApp';
import TypewriterText from '../../components/common/TypewriterText';
import { useAppeals } from '../../hooks/useData';
import { useAnimations } from '../../hooks/useAnimations';
import { supabase } from '../../lib/supabase';

interface HomeImage {
    id: string;
    title: string | null;
    description: string;
    url: string;
}

interface HomeVideo {
    id: string;
    title: string | null;
    description: string;
    url: string;
}

const getVideoEmbedUrl = (url: string) => {
    try {
        const parsedUrl = new URL(url);

        if (
            parsedUrl.hostname.includes('youtube.com') ||
            parsedUrl.hostname.includes('youtu.be')
        ) {
            const videoId =
                parsedUrl.hostname.includes('youtu.be')
                    ? parsedUrl.pathname.slice(1)
                    : parsedUrl.searchParams.get('v');

            return videoId ? `https://www.youtube.com/embed/${videoId}` : null;
        }

        if (parsedUrl.hostname.includes('vimeo.com')) {
            const videoId = parsedUrl.pathname.split('/').filter(Boolean).pop();
            return videoId ? `https://player.vimeo.com/video/${videoId}` : null;
        }
    } catch {
        return null;
    }

    return null;
};

const Home: React.FC = () => {
    const { appeals, loading: loadingAppeals } = useAppeals();
    const [homeImages, setHomeImages] = React.useState<HomeImage[]>([]);
    const [homeVideos, setHomeVideos] = React.useState<HomeVideo[]>([]);
    const [loadingMedia, setLoadingMedia] = React.useState(true);

    React.useEffect(() => {
        const fetchMedia = async () => {
            try {
                const [imagesResult, videosResult] = await Promise.all([
                    supabase
                        .from('gallery')
                        .select('*')
                        .order('created_at', { ascending: false })
                        .limit(4),
                    supabase
                        .from('videos')
                        .select('*')
                        .order('created_at', { ascending: false })
                        .limit(4),
                ]);
                setHomeImages(
                    (imagesResult.data ?? []).map(
                        (row) => ({ id: row.id, title: row.title, description: row.description ?? '', url: row.url } as HomeImage)
                    )
                );
                setHomeVideos(
                    (videosResult.data ?? []).map(
                        (row) => ({ id: row.id, title: row.title, description: row.description ?? '', url: row.url } as HomeVideo)
                    )
                );
            } catch (error) {
                console.error("Error fetching media:", error);
            } finally {
                setLoadingMedia(false);
            }
        };

        fetchMedia();
    }, []);

    // ... (existing variants) useAnimations hook usage or keep manual variants if they are fine. Keeping manual for minimal diff.
    // Wait, I should use useAnimations if I want consistency, but sticking to existing pattern is safer for now.

    const {
        slideInLeft: fadeInLeft,
        fadeInUp,
        dropIn,
        staggerContainer
    } = useAnimations();
    // ... (other variants)


    return (
        <div className="overflow-x-hidden">
            <SEO
                title="Home"
                description="Al-Ihsan Relief & Empowerment - Dedicated to lifting the burden of the needy through sustainable food, health, and education solely for the sake of Allah."
            />

            {/* 1. HERO SECTION (The Hook) */}
            <section className="relative min-h-[90vh] flex items-center justify-center overflow-hidden bg-primary-950">
                {/* Visual Background Placeholder */}
                <div className="absolute inset-0 bg-primary-900 z-0">
                    <div className="absolute inset-0 bg-gradient-to-r from-primary-950/90 to-primary-900/80 z-10"></div>
                    {/* Placeholder for "High-Quality Photo/Video" */}
                    <div className="absolute inset-0 z-0 opacity-20 bg-[url('https://www.transparenttextures.com/patterns/stardust.png')]"></div>
                </div>

                <div className="container mx-auto px-6 relative z-20 pt-0 md:pt-20">
                    <div className="flex flex-col md:flex-row items-center gap-12 text-center md:text-left">
                        {/* Text Content */}
                        <div className="flex-1">
                            <motion.div
                                initial={{ opacity: 0 }}
                                animate={{ opacity: 1 }}
                                transition={{ duration: 0.8 }}
                                className="mb-6"
                            >
                                <motion.span
                                    variants={dropIn}
                                    initial="hidden"
                                    animate="visible"
                                    className="inline-block px-4 py-1 rounded-full bg-gold-500/10 border border-gold-500/20 text-gold-400 text-sm font-bold tracking-widest uppercase mb-4"
                                >
                                    Bismillah-ir-Rahman-ir-Rahim
                                </motion.span>
                                <h1 className="text-4xl md:text-6xl lg:text-7xl font-heading font-bold text-white mb-6 leading-[1.1]">
                                    Empowering the <br className="hidden md:block" />
                                    <TypewriterText
                                        texts={["Ummah", "Orphans", "Widows", "Needy"]}
                                        className="text-gold-500 italic"
                                    /> <br className="hidden md:block" />
                                    through Sustainable Relief.
                                </h1>
                                <motion.p
                                    variants={fadeInLeft}
                                    initial="hidden"
                                    animate="visible"
                                    transition={{ delay: 0.5 }}
                                    className="text-xl text-primary-200 mb-8 max-w-xl mx-auto md:mx-0 font-light"
                                >
                                    Join us in our mission to lift the needy out of poverty. Your Sadaqah writes stories of hope.
                                </motion.p>

                                <motion.div
                                    className="flex flex-row gap-3 justify-center md:justify-start"
                                    initial={{ opacity: 0, y: 20 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    transition={{ delay: 0.8, duration: 0.5 }}
                                >
                                    <Link to="/donate" className="px-6 py-3 text-sm md:text-base bg-gold-500 text-primary-950 font-bold rounded-full shadow-lg hover:bg-gold-400 transition-all flex items-center justify-center gap-2 transform hover:scale-105 active:scale-95">
                                        Donate Now <Heart fill="currentColor" size={16} />
                                    </Link>
                                    <Link to="/focus" className="px-6 py-3 text-sm md:text-base border-2 border-white/20 text-white font-bold rounded-full hover:bg-white/10 transition-all transform hover:scale-105 active:scale-95">
                                        Our Projects
                                    </Link>
                                </motion.div>
                            </motion.div>
                        </div>

                        {/* Hero Visual/Card */}
                        <motion.div
                            className="flex-1 w-full max-w-lg hidden md:block"
                            initial={{ opacity: 0, x: 50 }}
                            animate={{ opacity: 1, x: 0 }}
                            transition={{ delay: 0.4, duration: 0.8 }}
                        >
                            <div className="relative aspect-square rounded-3xl overflow-hidden border-4 border-white/10 shadow-2xl group">
                                <img
                                    src="/logo.jpeg"
                                    alt="Al-Ihsan Relief & Empowerment"
                                    className="absolute inset-0 w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
                                />
                                <div className="absolute inset-0 bg-gradient-to-t from-primary-950/80 to-transparent"></div>

                                {/* Floating Overlay Card */}
                                <motion.div
                                    className="absolute bottom-6 left-6 right-6 bg-white/10 backdrop-blur-md p-6 rounded-2xl border border-white/20"
                                    initial={{ y: 50, opacity: 0 }}
                                    animate={{ y: 0, opacity: 1 }}
                                    transition={{ delay: 1, type: "spring" }}
                                >
                                    <div className="flex items-center gap-4">
                                        <div className="w-12 h-12 bg-gold-500 rounded-full flex items-center justify-center text-primary-900 font-bold shadow-lg shadow-gold-500/20">
                                            <Heart size={24} />
                                        </div>
                                        <div>
                                            <p className="text-white font-bold text-lg">Make a Difference</p>
                                            <p className="text-gold-300 text-sm">Your Sadaqah changes lives</p>
                                        </div>
                                        <Link to="/donate" className="ml-auto px-4 py-2 bg-white text-primary-900 text-sm font-bold rounded-lg hover:bg-gray-100 transition shadow-md">
                                            Donate
                                        </Link>
                                    </div>
                                </motion.div>
                            </div>
                        </motion.div>
                    </div>
                </div>
            </section>

            {/* 1.5. BRIEF ABOUT US */}
            {/* 1.5. BRIEF ABOUT US */}
            <section className="py-20 bg-white">
                <div className="container mx-auto px-6">
                    <motion.div
                        className="max-w-4xl mx-auto text-center"
                        variants={staggerContainer}
                        initial="hidden"
                        whileInView="visible"
                        viewport={{ once: true, margin: "-100px" }}
                    >
                        <motion.span variants={fadeInUp} className="text-gold-500 font-bold tracking-widest uppercase text-sm mb-2 block">Who We Are</motion.span>
                        <motion.h2 variants={fadeInUp} className="text-3xl md:text-4xl font-heading font-bold text-primary-900 mb-6">
                            Driven by Compassion, Guided by Faith
                        </motion.h2>
                        <motion.p variants={fadeInUp} className="text-lg text-gray-600 mb-8 leading-relaxed">
                            Al-Ihsan Relief & Empowerment was founded with a singular purpose: to serve humanity solely for the sake of Allah.
                            We believe that true worship is reflected in how we treat the most vulnerable among us - the orphans, the widows, and the destitute.
                            Based in Lagos, Nigeria, our operations span across food relief, medical assistance, educational support, and economic empowerment.
                        </motion.p>
                        <motion.div variants={fadeInUp} className="flex justify-center">
                            <Link to="/about" className="group flex items-center gap-2 text-primary-900 font-bold hover:text-gold-600 transition-colors">
                                Read More About Us
                                <ArrowRight size={20} className="group-hover:translate-x-1 transition-transform" />
                            </Link>
                        </motion.div>
                    </motion.div>
                </div>
            </section>

            {/* 4. IMPACT TRANSPARENCY (The "Proof") */}
            <motion.section
                className="py-20 bg-primary-900 text-white relative overflow-hidden"
                initial="hidden"
                whileInView="visible"
                viewport={{ once: true }}
            >
                <div className="absolute inset-0 bg-islamic-pattern opacity-10"></div>
                <div className="container mx-auto px-6 relative z-10">
                    <motion.div variants={staggerContainer} className="grid grid-cols-2 md:grid-cols-4 gap-8 text-center border-b border-white/10 pb-12 mb-12">
                        {[
                            { label: "Lives Impacted", value: 15000, suffix: "+" },
                            { label: "Meals Served", value: 50000, suffix: "+" },
                            { label: "Communities", value: 45, suffix: "" },
                            { label: "Volunteers", value: 120, suffix: "+" }
                        ].map((stat, i) => (
                            <motion.div key={i} variants={dropIn}>
                                <div className="text-4xl lg:text-5xl font-heading font-bold text-gold-500 mb-2">
                                    <CountUp end={stat.value} suffix={stat.suffix} />
                                </div>
                                <div className="text-primary-200 text-sm uppercase tracking-wider">{stat.label}</div>
                            </motion.div>
                        ))}
                    </motion.div>

                    <motion.div
                        className="flex flex-wrap justify-center gap-6 md:gap-16 opacity-60 grayscale hover:grayscale-0 transition-all duration-500"
                        variants={fadeInUp}
                    >
                        {/* Placeholder Trust Badges */}
                        <div className="flex items-center gap-2 text-sm"><ShieldCheck size={18} /> CAC Registered</div>
                        <div className="flex items-center gap-2 text-sm"><Building2 size={18} /> Shari'ah Compliant</div>
                        <div className="flex items-center gap-2 text-sm"><Users size={18} /> EFCC SCUML</div>
                    </motion.div>
                </div>
            </motion.section>

            {/* 2. URGENT APPEALS (The "Need") - Only show if data exists */}
            {appeals.length > 0 && (
                <section className="py-20 bg-gray-50">
                    <div className="container mx-auto px-6">
                        <motion.div
                            className="flex flex-col md:flex-row justify-between items-center text-center md:text-left mb-12 gap-6"
                            initial="hidden"
                            whileInView="visible"
                            viewport={{ once: true }}
                        >
                            <motion.div variants={fadeInLeft}>
                                <span className="text-red-500 font-bold tracking-widest uppercase text-sm mb-2 block animate-pulse">Emergency Response</span>
                                <h2 className="text-3xl md:text-4xl font-heading font-bold text-primary-900">Urgent Appeals</h2>
                            </motion.div>
                            <motion.div variants={fadeInUp} className="hidden md:flex gap-2">
                                <button className="w-10 h-10 border border-primary-200 rounded-full flex items-center justify-center hover:bg-primary-900 hover:text-white transition-colors">
                                    <ArrowRight className="rotate-180" size={20} />
                                </button>
                                <button className="w-10 h-10 border border-primary-900 bg-primary-900 text-white rounded-full flex items-center justify-center hover:bg-primary-800 transition-colors">
                                    <ArrowRight size={20} />
                                </button>
                            </motion.div>
                        </motion.div>

                        {/* Horizontal Slider (Grid for now) */}
                        <motion.div
                            className="grid grid-cols-1 md:grid-cols-3 gap-8"
                            variants={staggerContainer}
                            initial="hidden"
                            whileInView="visible"
                            viewport={{ once: true }}
                        >
                            {loadingAppeals ? (
                                <div className="col-span-3 text-center py-10 text-gray-400">Loading appeals...</div>
                            ) : (
                                appeals.map((appeal) => (
                                    <motion.div key={appeal.id} variants={fadeInUp}>
                                        <UrgentAppealCard
                                            title={appeal.title}
                                            description={appeal.description}
                                            raised={appeal.raised}
                                            goal={appeal.goal}
                                            imageUrl={appeal.imageUrl}
                                        />
                                    </motion.div>
                                ))
                            )}
                        </motion.div>
                    </div>
                </section>
            )}

            {/* 3. ZAKAT & SADAQAH QUICK LINKS */}
            <section className="py-20 bg-white">
                <div className="container mx-auto px-6">
                    <div className="grid lg:grid-cols-2 gap-16 items-start">
                        {/* Quick Links */}
                        <motion.div
                            className="text-center md:text-left"
                            initial="hidden"
                            whileInView="visible"
                            viewport={{ once: true }}
                            variants={staggerContainer}
                        >
                            <motion.div variants={fadeInLeft}>
                                <span className="text-gold-500 font-bold tracking-widest uppercase text-sm mb-2 block">Ways to Give</span>
                                <h2 className="text-3xl md:text-4xl font-heading font-bold text-primary-900 mb-8">Fulfill Your Obligation</h2>
                            </motion.div>

                            <div className="grid grid-cols-2 gap-4">
                                {[
                                    { title: "Pay Zakat", desc: "Purify your wealth (2.5%)", icon: Building2 },
                                    { title: "Sadaqah Jariyah", desc: "Build wells, mosques, trees", icon: Users2 },
                                    { title: "Orphan Sponsorship", desc: "Monthly support for a child", icon: Users },
                                    { title: "General Charity", desc: "Where needed most", icon: Heart }
                                ].map((item, i) => (
                                    <motion.div key={i} variants={fadeInUp}>
                                        <Link to="/donate" className="p-4 md:p-6 border border-gray-100 rounded-xl hover:shadow-lg hover:border-gold-500/30 transition-all group flex flex-col items-center md:items-start text-center md:text-left h-full">
                                            <div className="w-12 h-12 bg-primary-50 rounded-lg flex items-center justify-center text-primary-900 mb-4 group-hover:bg-gold-500 group-hover:text-white transition-colors">
                                                <item.icon size={24} />
                                            </div>
                                            <h3 className="font-bold text-lg text-primary-900 leading-tight mb-1">{item.title}</h3>
                                            <p className="text-xs md:text-sm text-gray-500">{item.desc}</p>
                                        </Link>
                                    </motion.div>
                                ))}
                            </div>
                        </motion.div>

                        {/* Mini Calculator */}
                        <motion.div
                            initial="hidden"
                            whileInView="visible"
                            viewport={{ once: true }}
                            variants={fadeInUp}
                        >
                            <ZakatCalculator />
                        </motion.div>
                    </div>
                </div>
            </section>



            {/* 6. WHERE YOUR MONEY GOES (The "Accountability") */}
            <motion.section
                className="py-20 bg-white"
                initial="hidden"
                whileInView="visible"
                viewport={{ once: true }}
            >
                <div className="container mx-auto px-6">
                    <div className="text-center mb-16">
                        <motion.span variants={dropIn} className="text-gold-500 font-bold tracking-widest uppercase text-sm mb-2 block">Transparency</motion.span>
                        <motion.h2 variants={dropIn} className="text-3xl md:text-4xl font-heading font-bold text-primary-900">Where Your Money Goes</motion.h2>
                        <motion.p variants={fadeInUp} className="text-gray-500 mt-4 max-w-2xl mx-auto">We categorize every donation to ensure it is used exactly as defined by Shari'ah and donor intent.</motion.p>
                    </div>

                    <ImpactPieChart />
                </div>
            </motion.section>


            {/* 7. LATEST MEDIA (Images & Videos) */}
            <section className="py-20 bg-white border-t border-gray-100">
                <div className="container mx-auto px-6">
                    {/* Images Section */}
                    <motion.div
                        initial="hidden"
                        whileInView="visible"
                        viewport={{ once: true }}
                        className="mb-20"
                    >
                        <div className="text-center mb-12">
                            <motion.span variants={dropIn} className="text-gold-500 font-bold tracking-widest uppercase text-sm mb-2 block">Gallery</motion.span>
                            <motion.h2 variants={dropIn} className="text-3xl md:text-4xl font-heading font-bold text-primary-900">Latest from Gallery</motion.h2>
                        </div>

                        {loadingMedia ? (
                            <div className="text-center py-10 text-gray-400">Loading images...</div>
                        ) : homeImages.length > 0 ? (
                            <motion.div variants={staggerContainer} className="grid grid-cols-2 md:grid-cols-4 gap-6">
                                {homeImages.map((img) => (
                                    <motion.div key={img.id} variants={fadeInUp}>
                                        <div className="group flex flex-col h-full bg-white rounded-2xl overflow-hidden shadow-sm hover:shadow-xl transition-shadow border border-gray-100 p-3">
                                            <div className="aspect-square rounded-xl overflow-hidden bg-gray-100 relative mb-4">
                                                <img src={img.url} alt={img.title || 'Gallery Image'} className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105" />
                                                <div className="absolute inset-0 bg-primary-900/10 opacity-0 group-hover:opacity-100 transition-opacity" />
                                            </div>
                                            <div className="flex-1 flex flex-col items-center text-center px-2">
                                                <h3 className="font-heading font-bold text-primary-900 text-lg md:text-xl line-clamp-1 group-hover:text-gold-600 transition-colors">{img.title || 'Untitled'}</h3>
                                                {img.description && <p className="text-sm text-gray-500 mt-2 line-clamp-2">{img.description}</p>}
                                                <div className="mt-auto pt-4">
                                                    <Link to={`/gallery?view=${img.id}`} className="inline-flex items-center justify-center gap-2 px-5 py-2 bg-primary-50 text-primary-900 rounded-full font-bold text-sm hover:bg-gold-500 hover:text-white transition-colors w-full">
                                                        <Eye size={16} /> View Post
                                                    </Link>
                                                </div>
                                            </div>
                                        </div>
                                    </motion.div>
                                ))}
                            </motion.div>
                        ) : (
                            <div className="text-center py-10 bg-gray-50 rounded-xl border border-gray-100">
                                <p className="text-gray-500">No image available</p>
                            </div>
                        )}

                        <div className="text-center mt-12">
                            <Link to="/gallery" className="inline-flex items-center gap-2 px-8 py-3 border-2 border-primary-900 text-primary-900 font-bold rounded-full hover:bg-primary-900 hover:text-white transition-all">
                                View Full Gallery <ArrowRight size={18} />
                            </Link>
                        </div>
                    </motion.div>

                    {/* Videos Section */}
                    <motion.div
                        initial="hidden"
                        whileInView="visible"
                        viewport={{ once: true }}
                    >
                        <div className="text-center mb-12">
                            <motion.span variants={dropIn} className="text-gold-500 font-bold tracking-widest uppercase text-sm mb-2 block">Watch</motion.span>
                            <motion.h2 variants={dropIn} className="text-3xl md:text-4xl font-heading font-bold text-primary-900">Our Impact in Action</motion.h2>
                        </div>

                        {loadingMedia ? (
                            <div className="text-center py-10 text-gray-400">Loading videos...</div>
                        ) : homeVideos.length > 0 ? (
                            <motion.div variants={staggerContainer} className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
                                {homeVideos.map((video) => (
                                    <motion.div key={video.id} variants={fadeInUp}>
                                        <div className="group flex flex-col h-full bg-white rounded-2xl overflow-hidden shadow-sm hover:shadow-xl transition-shadow border border-gray-100 p-3">
                                            <div className="aspect-video rounded-xl overflow-hidden bg-gray-900 relative mb-4">
                                                {getVideoEmbedUrl(video.url) ? (
                                                    <iframe
                                                        src={getVideoEmbedUrl(video.url) || undefined}
                                                        title={video.title || 'Video'}
                                                        className="w-full h-full pointer-events-none"
                                                        loading="lazy"
                                                    />
                                                ) : video.url.match(/\.(mp4|webm|ogg)(\?.*)?$/i) ? (
                                                    <video src={video.url} className="w-full h-full object-cover" preload="metadata" muted />
                                                ) : (
                                                    <div className="w-full h-full flex items-center justify-center bg-primary-950">
                                                        <div className="text-sm uppercase tracking-widest text-gold-400">Video</div>
                                                    </div>
                                                )}
                                                <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                                                    <div className="w-14 h-14 bg-white/90 backdrop-blur-sm rounded-full flex items-center justify-center group-hover:bg-gold-500 group-hover:text-white group-hover:scale-110 transition-all text-primary-900 shadow-lg">
                                                        <div className="w-0 h-0 border-t-[8px] border-t-transparent border-l-[12px] border-l-current border-b-[8px] border-b-transparent ml-1"></div>
                                                    </div>
                                                </div>
                                            </div>
                                            <div className="flex-1 flex flex-col items-center text-center px-2">
                                                <h3 className="font-heading font-bold text-primary-900 text-lg md:text-xl line-clamp-1 group-hover:text-gold-600 transition-colors">{video.title || 'Untitled Video'}</h3>
                                                {video.description && <p className="text-sm text-gray-500 mt-2 line-clamp-2">{video.description}</p>}
                                                <div className="mt-auto pt-4">
                                                    <Link to={`/gallery?view=${video.id}`} className="inline-flex items-center justify-center gap-2 px-5 py-2 bg-primary-50 text-primary-900 rounded-full font-bold text-sm hover:bg-gold-500 hover:text-white transition-colors w-full">
                                                        <Eye size={16} /> View Video
                                                    </Link>
                                                </div>
                                            </div>
                                        </div>
                                    </motion.div>
                                ))}
                            </motion.div>
                        ) : (
                            <div className="text-center py-10 bg-gray-50 rounded-xl border border-gray-100">
                                <p className="text-gray-500">No video available</p>
                            </div>
                        )}

                        <div className="text-center mt-12">
                            <Link to="/gallery" className="inline-flex items-center gap-2 px-8 py-3 bg-primary-900 text-white font-bold rounded-full hover:bg-primary-800 transition-all shadow-lg hover:shadow-xl">
                                Watch More Videos <ArrowRight size={18} />
                            </Link>
                        </div>
                    </motion.div>
                </div>
            </section>

            {/* SUCCESS STORIES */}
            <section className="py-20 bg-gray-50">
                <div className="container mx-auto px-4">
                    <motion.div
                        initial="hidden"
                        whileInView="visible"
                        viewport={{ once: true }}
                        variants={fadeInLeft}
                        className="max-w-3xl mx-auto text-center"
                    >
                        <span className="text-gold-500 font-bold tracking-widest uppercase text-sm mb-4 block">Success Stories</span>
                        <div className="bg-white p-8 md:p-12 rounded-2xl shadow-lg border border-gray-100 hover:shadow-xl transition-shadow duration-300">
                            <blockquote className="text-xl md:text-2xl text-primary-900 font-heading italic mb-6">
                                "Al-Ihsan Relief has been making a difference in the lives of the vulnerable — providing food, medical aid, education support, and more to communities across Nigeria."
                            </blockquote>
                            <p className="text-gray-600 text-sm leading-relaxed mb-6">
                                From Ramadan food distributions reaching hundreds of families, to educational scholarships that keep children in school, every donation creates a ripple effect of positive change. Our volunteers work tirelessly to ensure your Sadaqah reaches those who need it most.
                            </p>
                            <Link to="/gallery" className="inline-flex items-center gap-2 text-gold-600 font-bold hover:text-primary-900 transition">
                                See Our Impact <ArrowRight size={16} />
                            </Link>
                        </div>
                    </motion.div>
                </div>
            </section>

            {/* Newsletter */}
            <section className="py-20 bg-primary-950 border-t border-white/10">
                <motion.div
                    className="container mx-auto px-4 text-center max-w-2xl"
                    initial="hidden"
                    whileInView="visible"
                    viewport={{ once: true }}
                    variants={dropIn}
                >
                    <h2 className="text-3xl font-heading font-bold text-white mb-4">Join Our Community</h2>
                    <p className="text-primary-200 mb-8">Receive updates on our appeals and Islamic reminders.</p>
                    <div className="flex gap-2">
                        <input type="email" placeholder="Enter your email address" className="flex-1 p-3 rounded-lg bg-white/5 border border-white/10 text-white placeholder:text-gray-500 focus:border-gold-500 outline-none" />
                        <button className="px-6 py-3 bg-gold-500 text-primary-900 font-bold rounded-full hover:bg-gold-400 transition-colors">Subscribe</button>
                    </div>
                </motion.div>
            </section>

            <FloatingWhatsApp />
        </div>
    );
};

export default Home;
