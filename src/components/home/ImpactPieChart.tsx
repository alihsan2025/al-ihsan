import React from 'react';
import { motion } from 'framer-motion';

const ImpactPieChart: React.FC = () => {
    return (
        <div className="flex flex-col md:flex-row items-center gap-8 justify-center">
            {/* Chart */}
            <div className="relative w-64 h-64 rounded-full" style={{
                background: 'conic-gradient(#d4af37 0% 90%, #3e2744 90% 97%, #9ca3af 97% 100%)'
            }}>
                <div className="absolute inset-4 bg-white rounded-full flex items-center justify-center flex-col shadow-inner">
                    <span className="text-3xl font-bold text-gray-800">100%</span>
                    <span className="text-xs text-gray-500 uppercase tracking-widest">Transparent</span>
                </div>
            </div>

            {/* Legend */}
            <div className="space-y-4">
                <motion.div
                    initial={{ opacity: 0, x: 20 }}
                    whileInView={{ opacity: 1, x: 0 }}
                    className="flex items-center gap-3"
                >
                    <div className="w-4 h-4 rounded-sm bg-gold-500"></div>
                    <div>
                        <p className="font-bold text-gray-800">90% Programs</p>
                        <p className="text-xs text-gray-500">Direct relief, food, aid</p>
                    </div>
                </motion.div>
                <motion.div
                    initial={{ opacity: 0, x: 20 }}
                    whileInView={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.1 }}
                    className="flex items-center gap-3"
                >
                    <div className="w-4 h-4 rounded-sm bg-primary-900"></div>
                    <div>
                        <p className="font-bold text-gray-800">7% Admin</p>
                        <p className="text-xs text-gray-500">Operations, logistics</p>
                    </div>
                </motion.div>
                <motion.div
                    initial={{ opacity: 0, x: 20 }}
                    whileInView={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.2 }}
                    className="flex items-center gap-3"
                >
                    <div className="w-4 h-4 rounded-sm bg-gray-400"></div>
                    <div>
                        <p className="font-bold text-gray-800">3% Fundraising</p>
                        <p className="text-xs text-gray-500">Marketing, awareness</p>
                    </div>
                </motion.div>
            </div>
        </div>
    );
};

export default ImpactPieChart;
