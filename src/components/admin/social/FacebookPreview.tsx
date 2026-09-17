import React from 'react';
import { Share2, MessageCircle, ThumbsUp, MoreHorizontal, Globe, Copy, CheckCircle } from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';

interface FacebookPreviewProps {
    authorName?: string;
    authorImage?: string;
    text: string;
    mediaUrls?: string[];
    date?: Date;
    onCopy?: () => void;
    copied?: boolean;
}

const FacebookPreview: React.FC<FacebookPreviewProps> = ({
    authorName = 'Al-Ihsan Relief and Empowerment',
    authorImage = '/logo.jpeg',
    text,
    mediaUrls = [],
    date = new Date(),
    onCopy,
    copied = false
}) => {
    
    // Process text for preview (simple line breaks to <br />)
    const formattedText = text.split('\n').map((line, i) => (
        <React.Fragment key={i}>
            {line}
            {i !== text.split('\n').length - 1 && <br />}
        </React.Fragment>
    ));

    return (
        <div className="flex flex-col h-full bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl overflow-hidden relative shadow-inner">
            <div className="bg-white dark:bg-slate-800 border-b border-slate-200 dark:border-slate-700 p-3 flex justify-between items-center sticky top-0 z-10 shadow-sm">
                <span className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-widest flex items-center gap-1.5">
                    <Globe size={14} /> Facebook Mobile Preview
                </span>
                <button
                    onClick={onCopy}
                    className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold transition-colors shadow-sm
                        ${copied
                            ? 'bg-emerald-100 text-emerald-700 border border-emerald-200 dark:bg-emerald-900/40 dark:text-emerald-400 dark:border-emerald-800/50'
                            : 'bg-primary-50 text-primary-700 border border-primary-200 hover:bg-primary-100 dark:bg-primary-900/40 dark:text-primary-400 dark:border-primary-800/50'
                        }`}
                >
                    {copied ? <CheckCircle size={14} /> : <Copy size={14} />}
                    {copied ? 'Copied to Clipboard!' : 'Copy Post Text'}
                </button>
            </div>

            <div className="p-4 flex-1 overflow-y-auto w-full max-w-[420px] mx-auto">
                <div className="bg-white shadow-[0_1px_2px_rgba(0,0,0,0.1)] rounded-xl overflow-hidden">
                    {/* FB Header */}
                    <div className="p-3 pb-2 flex items-start gap-2.5">
                        <img src={authorImage} alt={authorName} className="w-10 h-10 rounded-full border border-slate-100 object-cover" />
                        <div className="flex-1">
                            <h4 className="font-bold text-[15px] text-[#1c1e21] leading-tight">{authorName}</h4>
                            <div className="flex items-center gap-1 text-[#65676b] text-[13px] mt-0.5">
                                <span>{formatDistanceToNow(date, { addSuffix: true })}</span>
                                <span>·</span>
                                <Globe size={12} className="opacity-80" />
                            </div>
                        </div>
                        <button className="text-[#65676b] p-1"><MoreHorizontal size={20} /></button>
                    </div>

                    {/* FB Body */}
                    <div className="px-3 pb-3 text-[15px] text-[#050505] break-words whitespace-pre-wrap leading-normal font-normal font-sans">
                        {text ? formattedText : <span className="text-slate-400 italic">Start typing to preview...</span>}
                    </div>

                    {/* FB Media (Masonry/Grid logic based on length) */}
                    {mediaUrls.length > 0 && (
                        <div className={`mt-1 grid gap-[2px] ${mediaUrls.length === 1 ? 'grid-cols-1' : mediaUrls.length === 2 ? 'grid-cols-2 aspect-video' : mediaUrls.length === 3 ? 'grid-cols-2 grid-rows-2' : 'grid-cols-2 grid-rows-2'}`}>
                            {mediaUrls.slice(0, 4).map((url, i) => (
                                <div key={i} className={`relative overflow-hidden bg-slate-100 ${mediaUrls.length === 3 && i === 0 ? 'row-span-2' : ''}`}>
                                    <img src={url} alt="Post media" className="w-full h-full object-cover min-h-[200px]" />
                                    {mediaUrls.length > 4 && i === 3 && (
                                        <div className="absolute inset-0 bg-black/50 flex items-center justify-center">
                                            <span className="text-white text-3xl font-bold">+{mediaUrls.length - 4}</span>
                                        </div>
                                    )}
                                </div>
                            ))}
                        </div>
                    )}

                    {/* FB Footer */}
                    <div className="px-4 py-2 flex items-center justify-between text-[#65676b] border-t border-[#ced0d4] mt-1 mx-3">
                        <button className="flex items-center justify-center gap-2 flex-1 py-1.5 hover:bg-slate-50 rounded-md font-semibold text-[15px]">
                            <ThumbsUp size={18} /> Like
                        </button>
                        <button className="flex items-center justify-center gap-2 flex-1 py-1.5 hover:bg-slate-50 rounded-md font-semibold text-[15px]">
                            <MessageCircle size={18} /> Comment
                        </button>
                        <button className="flex items-center justify-center gap-2 flex-1 py-1.5 hover:bg-slate-50 rounded-md font-semibold text-[15px]">
                            <Share2 size={18} /> Share
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default FacebookPreview;
