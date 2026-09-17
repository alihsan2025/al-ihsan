import React, { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { Heart, Droplets, BookOpen, Stethoscope, HandHeart, Coins } from 'lucide-react';
import SEO from '../../components/common/SEO';
import { useAnimations } from '../../hooks/useAnimations';
import { supabase } from '../../lib/supabase';

interface Project {
    id: string;
    title: string;
    description: string;
    imageUrl?: string;
    category?: string;
}

const Focus: React.FC = () => {
    const { slideInLeft, fadeInUp, scaleIn, staggerContainer } = useAnimations();
    const [projects, setProjects] = useState<Project[]>([]);
    const [loading, setLoading] = useState(true);

    const pillars = [
        {
            id: 'food',
            icon: Heart,
            color: 'bg-red-100 text-red-600',
            title: 'Food Relief',
            desc: 'Combating hunger through monthly food parcels and community kitchens.'
        },
        {
            id: 'water',
            icon: Droplets,
            color: 'bg-blue-100 text-blue-600',
            title: 'Clean Water',
            desc: 'Building wells and boreholes to provide safe drinking water to remote villages.'
        },
        {
            id: 'education',
            icon: BookOpen,
            color: 'bg-green-100 text-green-600',
            title: 'Education',
            desc: 'Sponsoring orphans and renovating schools for a brighter future.'
        },
        {
            id: 'health',
            icon: Stethoscope,
            color: 'bg-purple-100 text-purple-600',
            title: 'Medical Aid',
            desc: 'Providing free health camps, surgeries, and medicines to the sick.'
        },
        {
            id: 'welfare',
            icon: HandHeart,
            color: 'bg-orange-100 text-orange-600',
            title: 'Social Welfare',
            desc: 'Supporting widows, the elderly, and vulnerable families with monthly stipends.'
        },
        {
            id: 'zakat',
            icon: Coins,
            color: 'bg-gold-100 text-gold-600',
            title: 'Zakat & Empowerment',
            desc: 'Distributing Zakat to eligible recipients and funding small businesses.'
        },
    ];

    useEffect(() => {
        const fetchProjects = async () => {
            try {
                const { data, error } = await supabase
                    .from('projects')
                    .select('*')
                    .order('created_at', { ascending: false });

                if (error) throw error;

                setProjects(
                    (data ?? []).map((row) => ({
                        id: row.id,
                        title: row.title,
                        description: row.description,
                        imageUrl: row.image_url ?? undefined,
                        category: row.category ?? undefined,
                    }))
                );
            } catch (error) {
                console.error("Error fetching projects:", error);
            } finally {
                setLoading(false);
            }
        };

        fetchProjects();
    }, []);

    return (
        <div className="min-h-screen bg-gray-50 pb-20">
            <SEO
                title="Our Programs"
                description="Explore the core areas of our work: Food Relief, Water, Education, Medical Aid, and Economic Empowerment."
            />

            {/* Header */}
            <section className="bg-primary-950 py-20 px-6 text-center rounded-b-[3rem] shadow-xl relative overflow-hidden">
                <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/stardust.png')] opacity-10"></div>
                <div className="relative z-10 max-w-4xl mx-auto">
                    <motion.span variants={scaleIn} initial="hidden" animate="visible" className="text-gold-500 font-bold tracking-widest uppercase text-sm mb-4 block">Our Focus</motion.span>
                    <motion.h1 variants={slideInLeft} initial="hidden" animate="visible" className="text-4xl md:text-5xl font-heading font-bold text-white mb-6">Serving Across Key Pillars</motion.h1>
                    <motion.p variants={fadeInUp} initial="hidden" animate="visible" className="text-primary-200 text-lg max-w-2xl mx-auto">
                        Our comprehensive approach ensures we uplift communities holistically, addressing immediate needs while building sustainable futures.
                    </motion.p>
                </div>
            </section>

            {/* Core Pillars Grid */}
            <section className="container mx-auto px-6 -mt-10 relative z-20 mb-20">
                <motion.div
                    variants={staggerContainer}
                    initial="hidden"
                    whileInView="visible"
                    viewport={{ once: true }}
                    className="grid md:grid-cols-2 lg:grid-cols-3 gap-6"
                >
                    {pillars.map((pillar) => (
                        <motion.div key={pillar.id} variants={fadeInUp} className="bg-white p-8 rounded-2xl shadow-lg border border-gray-100 hover:shadow-xl transition-all duration-300 text-center md:text-left">
                            <div className={`w-14 h-14 ${pillar.color} rounded-xl flex items-center justify-center mb-6 mx-auto md:mx-0`}>
                                <pillar.icon size={28} />
                            </div>
                            <h3 className="text-2xl font-bold text-primary-900 mb-3">{pillar.title}</h3>
                            <p className="text-gray-600 leading-relaxed">{pillar.desc}</p>
                        </motion.div>
                    ))}
                </motion.div>
            </section>

            {/* Dynamic Projects Section */}
            <section className="container mx-auto px-6">
                <motion.div
                    initial="hidden"
                    whileInView="visible"
                    viewport={{ once: true }}
                    className="mb-12"
                >
                    <h2 className="text-3xl font-heading font-bold text-primary-900 border-b-4 md:border-b-0 md:border-l-4 border-gold-500 pb-4 md:pb-0 md:pl-4 text-center md:text-left w-fit mx-auto md:mx-0 md:w-full">Recent Projects & Campaigns</h2>
                </motion.div>


                {loading ? (
                    <div className="text-center py-20 text-gray-400">Loading projects...</div>
                ) : projects.length > 0 ? (
                    <motion.div
                        variants={staggerContainer}
                        initial="hidden"
                        whileInView="visible"
                        viewport={{ once: true }}
                        className="grid md:grid-cols-3 gap-8"
                    >
                        {projects.map((project) => (
                            <motion.div key={project.id} variants={fadeInUp} className="bg-white rounded-xl overflow-hidden shadow-md group hover:shadow-xl transition-all">
                                <div className="h-56 bg-gray-200 relative overflow-hidden">
                                    {project.imageUrl ? (
                                        <img src={project.imageUrl} alt={project.title} className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110" />
                                    ) : (
                                        <div className="w-full h-full flex items-center justify-center text-gray-400">No Image</div>
                                    )}
                                    <div className="absolute top-4 right-4 bg-white/90 px-3 py-1 rounded-full text-xs font-bold text-primary-900 uppercase tracking-widest shadow-sm">
                                        {project.category || 'General'}
                                    </div>
                                </div>
                                <div className="p-6 text-center md:text-left">
                                    <h3 className="text-xl font-bold text-primary-900 mb-3 group-hover:text-gold-600 transition-colors">{project.title}</h3>
                                    <p className="text-gray-600 text-sm line-clamp-3 mb-4">{project.description}</p>
                                    <button className="text-gold-600 font-bold text-sm uppercase tracking-wider hover:text-primary-900 transition-colors mx-auto md:mx-0 block">See Details</button>
                                </div>
                            </motion.div>
                        ))}
                    </motion.div>
                ) : (
                    <div className="text-center py-12 bg-white rounded-xl border border-gray-100 shadow-sm">
                        <p className="text-gray-500">More detailed project listings coming soon.</p>
                    </div>
                )}
            </section>
        </div>
    );
};

export default Focus;
