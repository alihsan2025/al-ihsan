import React from 'react';
import { motion } from 'framer-motion';
import { Users, Target, Heart, Shield } from 'lucide-react';

import SEO from '../../components/common/SEO';
import { useAnimations } from '../../hooks/useAnimations';

const About: React.FC = () => {
    const { slideInLeft, fadeInUp, staggerContainer, dropIn, scaleIn } = useAnimations();

    return (
        <div className="bg-gray-50 min-h-screen">
            <SEO
                title="About Us"
                description="Learn about Al-Ihsan Relief's mission, vision, and team. We are driven by compassion and guided by faith to serve humanity."
            />
            {/* Header */}
            <header className="relative py-20 bg-primary-900 overflow-hidden -mt-[88px] pt-[150px]">
                {/* Decorative CSS Background */}
                <div className="absolute inset-0 overflow-hidden">
                    <div className="absolute -top-[50%] -left-[20%] w-[100%] h-[200%] bg-gradient-to-br from-primary-800/50 to-transparent rotate-12 rounded-[100px]"></div>
                    <div className="absolute bottom-0 right-0 w-96 h-96 bg-gold-500/10 rounded-full blur-3xl"></div>
                </div>

                <div className="container mx-auto px-4 relative z-10 text-center">
                    <motion.h1
                        variants={slideInLeft}
                        initial="hidden"
                        animate="visible"
                        className="text-4xl md:text-6xl font-heading font-bold text-white mb-4"
                    >
                        Who We Are
                    </motion.h1>
                    <motion.div
                        variants={scaleIn}
                        initial="hidden"
                        animate="visible"
                        transition={{ delay: 0.2 }}
                        className="w-24 h-1 bg-gold-500 mx-auto rounded-full"
                    ></motion.div>
                </div>
            </header>

            {/* Mission & Vision */}
            <section className="py-20">
                <div className="container mx-auto px-4">
                    <div className="max-w-4xl mx-auto text-center mb-20">
                        <motion.div
                            initial="hidden"
                            whileInView="visible"
                            viewport={{ once: true }}
                            variants={fadeInUp}
                        >
                            <motion.div variants={dropIn} className="w-20 h-20 bg-primary-100 rounded-full flex items-center justify-center mx-auto mb-8 text-primary-900">
                                <Heart size={40} fill="currentColor" className="text-primary-900" />
                            </motion.div>
                            <motion.h2 variants={slideInLeft} className="text-3xl md:text-4xl font-heading font-bold text-primary-900 mb-6">Driven by Compassion, Guided by Faith</motion.h2>
                            <motion.p variants={fadeInUp} className="text-lg text-gray-600 mb-6 leading-relaxed">
                                Al-Ihsan Relief & Empowerment was founded with a singular purpose: to serve humanity solely for the sake of Allah. We believe that true worship is reflected in how we treat the most vulnerable among us - the orphans, the widows, and the destitute.
                            </motion.p>
                            <motion.p variants={fadeInUp} className="text-lg text-gray-600 leading-relaxed">
                                Based in Lagos, Nigeria, our operations span across food relief, medical assistance, educational support, and economic empowerment. We don't just provide aid; we strive to restore dignity.
                            </motion.p>
                        </motion.div>
                    </div>

                    <motion.div
                        className="grid md:grid-cols-3 gap-8"
                        variants={staggerContainer}
                        initial="hidden"
                        whileInView="visible"
                        viewport={{ once: true }}
                    >
                        {[
                            { icon: Target, title: "Our Mission", desc: "To provide sustainable relief and empowerment to vulnerable communities through transparent, efficient, and compassionate service." },
                            { icon: Heart, title: "Our Vision", desc: "A world where every individual, regardless of their circumstances, lives with dignity, hope, and access to basic human needs." },
                            { icon: Shield, title: "Our Values", desc: "Ihsan (Excellence), Amanah (Trust), Compassion, and Transparency in all our dealings with beneficiaries and donors." }
                        ].map((item, i) => (
                            <motion.div
                                key={i}
                                variants={fadeInUp}
                                className="bg-white p-8 rounded-2xl shadow-sm border border-gray-100 hover:shadow-md transition-shadow text-center"
                            >
                                <div className="w-16 h-16 mx-auto bg-primary-50 rounded-full flex items-center justify-center text-primary-600 mb-6">
                                    <item.icon size={32} />
                                </div>
                                <h3 className="text-xl font-bold text-primary-900 mb-3">{item.title}</h3>
                                <p className="text-gray-600">{item.desc}</p>
                            </motion.div>
                        ))}
                    </motion.div>
                </div>
            </section>

            {/* Team Section (Placeholder) */}
            <section className="py-20 bg-primary-900 text-white">
                <div className="container mx-auto px-4 text-center">
                    <motion.h2
                        variants={slideInLeft}
                        initial="hidden"
                        whileInView="visible"
                        viewport={{ once: true }}
                        className="text-3xl font-heading font-bold mb-12"
                    >
                        Our Leadership
                    </motion.h2>
                    <motion.div
                        className="grid md:grid-cols-3 gap-8 max-w-4xl mx-auto"
                        variants={staggerContainer}
                        initial="hidden"
                        whileInView="visible"
                        viewport={{ once: true }}
                    >
                        {/* Add real team members here later */}
                        {[1, 2, 3].map((_, i) => (
                            <motion.div key={i} variants={fadeInUp} className="group">
                                <div className="w-32 h-32 mx-auto bg-primary-800 rounded-full mb-4 border-2 border-gold-500 overflow-hidden relative">
                                    <Users className="w-full h-full p-8 text-primary-600" />
                                </div>
                                <h3 className="text-xl font-bold text-white">Board Member</h3>
                                <p className="text-gold-400 text-sm">Trustee</p>
                            </motion.div>
                        ))}
                    </motion.div>
                </div>
            </section>
        </div>
    );
};

export default About;
