import React from 'react';
import { Link } from 'react-router-dom';

interface UrgentAppealProps {
    title: string;
    description: string;
    raised: number;
    goal: number;
    imageUrl?: string;
}

const UrgentAppealCard: React.FC<UrgentAppealProps> = ({ title, description, raised, goal, imageUrl }) => {
    const percentage = goal > 0 ? Math.min((raised / goal) * 100, 100) : 0;

    return (
        <div className="bg-white rounded-xl shadow-lg border border-gray-100 overflow-hidden flex flex-col h-full hover:shadow-xl transition-shadow duration-300">
            <div className="h-48 relative overflow-hidden group">
                {imageUrl ? (
                    <img src={imageUrl} alt={title} className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110" />
                ) : (
                    <div className="w-full h-full bg-gray-200 flex items-center justify-center">
                        <span className="text-gray-400 font-medium">No Image</span>
                    </div>
                )}
                <div className="absolute top-4 left-4 bg-red-600 text-white text-xs font-bold px-3 py-1 rounded-full animate-pulse shadow-sm">
                    URGENT
                </div>
            </div>

            <div className="p-6 flex flex-col flex-grow">
                <h3 className="text-xl font-heading font-bold text-primary-900 mb-2">{title}</h3>
                <p className="text-gray-600 text-sm mb-6 flex-grow">{description}</p>

                <div className="mb-4">
                    <div className="flex justify-between text-sm font-bold mb-2">
                        <span className="text-gold-600">₦{raised.toLocaleString()} Raised</span>
                        <span className="text-gray-400">
                            {goal > 0 ? `of ₦${goal.toLocaleString()}` : 'Goal pending'}
                        </span>
                    </div>
                    <div className="w-full bg-gray-100 rounded-full h-2.5 overflow-hidden">
                        <div
                            className="bg-gold-500 h-2.5 rounded-full transition-all duration-1000"
                            style={{ width: `${percentage}%` }}
                        ></div>
                    </div>
                </div>

                <Link
                    to="/donate"
                    className="w-full py-3 bg-primary-900 text-white rounded-full font-bold text-center hover:bg-primary-800 transition-colors"
                >
                    Donate Now
                </Link>
            </div>
        </div>
    );
};

export default UrgentAppealCard;
