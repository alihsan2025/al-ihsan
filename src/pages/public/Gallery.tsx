import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, ZoomIn, Loader, Play, Film, ChevronLeft, Calendar, Tag } from 'lucide-react';
import SEO from '../../components/common/SEO';
import { useAnimations } from '../../hooks/useAnimations';
import { supabase } from '../../lib/supabase';

const categories = ["All", "Food Relief", "Medical", "Education", "Orphans", "Events", "Videos"];

interface GalleryItem {
    id: string;
    url: string;
    additionalUrls?: string[];
    category: string;
    title: string;
    description: string;
    mediaType: 'image' | 'video' | 'video_link';
    source: 'gallery' | 'videos';
    createdAt: string;
}

const isVideoFile = (url: string) => /\.(mp4|webm|ogg)(\?.*)?$/i.test(url);

const getEmbedUrl = (url: string): string | null => {
    try {
        const parsed = new URL(url);
        if (parsed.hostname.includes('youtube.com') || parsed.hostname.includes('youtu.be')) {
            const videoId = parsed.hostname.includes('youtu.be')
                ? parsed.pathname.slice(1)
                : parsed.searchParams.get('v');
            return videoId ? `https://www.youtube.com/embed/${videoId}` : null;
        }
        if (parsed.hostname.includes('vimeo.com')) {
            const videoId = parsed.pathname.split('/').filter(Boolean).pop();
            return videoId ? `https://player.vimeo.com/video/${videoId}` : null;
        }
    } catch { /* ignore */ }
    return null;
};

const getYouTubeThumbnail = (url: string): string | null => {
    try {
        const parsed = new URL(url);
        let videoId: string | null = null;
        if (parsed.hostname.includes('youtu.be')) {
            videoId = parsed.pathname.slice(1);
        } else if (parsed.hostname.includes('youtube.com')) {
            videoId = parsed.searchParams.get('v');
        }
        return videoId ? `https://img.youtube.com/vi/${videoId}/hqdefault.jpg` : null;
    } catch { return null; }
};

const formatDate = (v: string) =>
    new Date(v).toLocaleDateString('en-GB', { day: 'numeric', month: 'long', year: 'numeric' });

const Gallery: React.FC = () => {
    const { slideInLeft, fadeInUp, staggerContainer } = useAnimations();
    const [activeCategory, setActiveCategory] = useState("All");
    const [items, setItems] = useState<GalleryItem[]>([]);
    const [loading, setLoading] = useState(true);
    const [selectedItem, setSelectedItem] = useState<GalleryItem | null>(null);
    const [selectedMediaIndex, setSelectedMediaIndex] = useState(0);

    const handleClose = () => {
        setSelectedItem(null);
        const url = new URL(window.location.href);
        url.searchParams.delete('view');
        window.history.replaceState({}, '', url.toString());
    };

    useEffect(() => {
        if (selectedItem) setSelectedMediaIndex(0);
    }, [selectedItem]);

    useEffect(() => {
        const loadMedia = async () => {
            try {
                const [galleryRes, videosRes] = await Promise.all([
                    supabase.from('gallery').select('*').order('created_at', { ascending: false }),
                    supabase.from('videos').select('*').order('created_at', { ascending: false }),
                ]);

                const galleryItems: GalleryItem[] = (galleryRes.data ?? []).map((row: any) => ({
                    id: row.id,
                    url: row.url,
                    additionalUrls: row.additional_urls || [],
                    category: row.category ?? 'General',
                    title: row.title ?? '',
                    description: row.description ?? '',
                    mediaType: row.media_type === 'video' ? 'video' : 'image',
                    source: 'gallery' as const,
                    createdAt: row.created_at ?? new Date().toISOString(),
                }));

                const videoItems: GalleryItem[] = (videosRes.data ?? []).map((row: any) => ({
                    id: `vid-${row.id}`,
                    url: row.url,
                    additionalUrls: row.additional_urls || [],
                    category: row.category ?? 'Videos',
                    title: row.title ?? '',
                    description: row.description ?? '',
                    mediaType: 'video_link' as const,
                    source: 'videos' as const,
                    createdAt: row.created_at ?? new Date().toISOString(),
                }));

                const allItems = [...galleryItems, ...videoItems];
                setItems(allItems);

                // Auto-open modal if ?view=id is in the URL
                const searchParams = new URLSearchParams(window.location.search);
                const viewId = searchParams.get('view');
                if (viewId) {
                    const itemToView = allItems.find(i => i.id === viewId || i.id === `vid-${viewId}`);
                    if (itemToView) {
                        setSelectedItem(itemToView);
                    }
                }
            } catch (e) {
                console.error('Failed to load media:', e);
            }
            setLoading(false);
        };

        loadMedia();

        const channel = supabase
            .channel('gallery_realtime')
            .on(
                'postgres_changes',
                { event: '*', schema: 'public', table: 'gallery' },
                () => { loadMedia(); }
            )
            .subscribe();

        return () => { supabase.removeChannel(channel); };
    }, []);

    const filteredItems = activeCategory === "All"
        ? items
        : activeCategory === "Videos"
            ? items.filter(i => i.mediaType === 'video' || i.mediaType === 'video_link')
            : items.filter(i => i.category === activeCategory);

    const isVideo = (item: GalleryItem) => item.mediaType === 'video' || item.mediaType === 'video_link';

    // Get related items (same category, excluding selected)
    const relatedItems = selectedItem
        ? items.filter(i => i.id !== selectedItem.id && i.category === selectedItem.category).slice(0, 6)
        : [];

    return (
        <div className="bg-gray-50 min-h-screen py-20">
            <SEO
                title="Media Gallery"
                description="View our impact in pictures and videos. Al-Ihsan Relief gallery showcasing food distribution, medical camps, educational support, and community events."
            />
            <div className="container mx-auto px-4">
                <div className="text-center mb-12">
                    <motion.h1 variants={slideInLeft} initial="hidden" animate="visible" className="text-4xl md:text-5xl font-heading font-bold text-primary-900 mb-4">Our Impact in Pictures & Videos</motion.h1>
                    <motion.p variants={fadeInUp} initial="hidden" animate="visible" className="text-gray-600 max-w-2xl mx-auto">
                        Witness the joy and relief your donations bring to the community.
                    </motion.p>
                </div>

                {/* Filter Buttons */}
                <motion.div
                    variants={staggerContainer}
                    initial="hidden"
                    animate="visible"
                    className="flex flex-wrap justify-center gap-3 mb-12"
                >
                    {categories.map((cat) => (
                        <motion.button
                            key={cat}
                            variants={fadeInUp}
                            onClick={() => setActiveCategory(cat)}
                            whileHover={{ scale: 1.05 }}
                            whileTap={{ scale: 0.95 }}
                            className={`px-5 py-2 rounded-full text-sm font-medium transition-all flex items-center gap-1.5 ${activeCategory === cat
                                ? 'bg-gold-500 text-white shadow-lg'
                                : 'bg-white text-gray-600 hover:bg-gray-100'
                                }`}
                        >
                            {cat === 'Videos' && <Film size={14} />}
                            {cat}
                        </motion.button>
                    ))}
                </motion.div>

                {/* Loading State */}
                {loading && (
                    <div className="flex justify-center py-20">
                        <Loader className="animate-spin text-gold-500" size={40} />
                    </div>
                )}

                {/* Empty State */}
                {!loading && items.length === 0 && (
                    <div className="text-center py-20 bg-white rounded-2xl shadow-sm border border-gray-100">
                        <p className="text-gray-500">No media uploaded yet. Check back soon!</p>
                    </div>
                )}

                {/* Grid */}
                <motion.div
                    layout
                    variants={staggerContainer}
                    initial="hidden"
                    animate="visible"
                    className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6"
                >
                    <AnimatePresence>
                        {filteredItems.map((item) => (
                            <motion.div
                                layout
                                variants={fadeInUp}
                                initial="hidden"
                                animate="visible"
                                exit={{ opacity: 0, scale: 0.9 }}
                                key={item.id}
                                className="group cursor-pointer"
                                onClick={() => setSelectedItem(item)}
                            >
                                {/* Thumbnail Container */}
                                <div className="relative rounded-2xl overflow-hidden shadow-md aspect-[4/3] bg-gray-200">
                                    {item.mediaType === 'image' ? (
                                        <img src={item.url} alt={item.title} className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110" />
                                    ) : item.mediaType === 'video' && isVideoFile(item.url) ? (
                                        <video src={item.url} className="w-full h-full object-cover" preload="metadata" muted />
                                    ) : item.mediaType === 'video_link' ? (
                                        <div className="w-full h-full bg-primary-900 relative">
                                            {getYouTubeThumbnail(item.url) ? (
                                                <img src={getYouTubeThumbnail(item.url)!} alt={item.title} className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110" />
                                            ) : (
                                                <div className="w-full h-full flex items-center justify-center">
                                                    <Film size={48} className="text-gold-400 opacity-50" />
                                                </div>
                                            )}
                                        </div>
                                    ) : (
                                        <div className="w-full h-full bg-primary-900 flex items-center justify-center">
                                            <Film size={48} className="text-gold-400 opacity-50" />
                                        </div>
                                    )}

                                    {/* Video Play Badge / Multiple Media Badge */}
                                    <div className="absolute top-3 left-3 flex gap-2">
                                        {isVideo(item) && (
                                            <div className="bg-primary-900/80 backdrop-blur-sm text-white px-2.5 py-1 rounded-lg text-[10px] font-bold uppercase tracking-wider flex items-center gap-1">
                                                <Play size={10} fill="currentColor" /> Video
                                            </div>
                                        )}
                                        {(item.additionalUrls?.length ?? 0) > 0 && (
                                            <div className="bg-black/80 backdrop-blur-sm text-white px-2.5 py-1 rounded-lg text-[10px] font-bold uppercase tracking-wider flex items-center gap-1">
                                                + {item.additionalUrls?.length}
                                            </div>
                                        )}
                                    </div>

                                    {/* Hover Overlay */}
                                    <div className="absolute inset-0 bg-primary-900/60 opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-center justify-center">
                                        {isVideo(item) ? <Play size={48} className="text-gold-400 drop-shadow-lg" fill="currentColor" /> : <ZoomIn size={48} className="text-gold-400 drop-shadow-lg" />}
                                    </div>
                                </div>

                                {/* Title + Category Below Card */}
                                <div className="mt-3 px-1">
                                    <h3 className="font-heading font-bold text-primary-900 text-base line-clamp-1">{item.title || 'Untitled'}</h3>
                                    <div className="flex items-center gap-2 mt-1">
                                        <span className="text-xs text-gold-600 font-medium">{item.category}</span>
                                        {isVideo(item) && (
                                            <span className="text-[10px] bg-primary-100 text-primary-700 px-1.5 py-0.5 rounded font-bold uppercase tracking-wider">Video</span>
                                        )}
                                    </div>
                                </div>
                            </motion.div>
                        ))}
                    </AnimatePresence>
                </motion.div>
            </div>

            {/* Detail View Modal */}
            <AnimatePresence>
                {selectedItem && (
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        className="fixed inset-0 z-[100] bg-black/90 backdrop-blur-sm overflow-y-auto"
                        onClick={handleClose}
                    >
                        <div className="min-h-screen flex flex-col">
                            {/* Top Bar */}
                            <div className="flex items-center justify-between p-4 md:p-6 sticky top-0 z-10 bg-gradient-to-b from-black/80 to-transparent">
                                <button
                                    onClick={(e) => { e.stopPropagation(); handleClose(); }}
                                    className="flex items-center gap-2 text-white/80 hover:text-white transition-colors font-medium text-sm"
                                >
                                    <ChevronLeft size={20} /> Back to Gallery
                                </button>
                                <button
                                    onClick={(e) => { e.stopPropagation(); handleClose(); }}
                                    className="text-white/60 hover:text-white transition-colors"
                                >
                                    <X size={24} />
                                </button>
                            </div>

                            {/* Content */}
                            <div className="flex-1 flex items-center justify-center p-4" onClick={(e) => e.stopPropagation()}>
                                <motion.div
                                    initial={{ scale: 0.95, opacity: 0, y: 20 }}
                                    animate={{ scale: 1, opacity: 1, y: 0 }}
                                    exit={{ scale: 0.95, opacity: 0, y: 20 }}
                                    transition={{ duration: 0.4, ease: [0.23, 1, 0.32, 1] }}
                                    className="w-full max-w-7xl h-[85vh] flex flex-col md:flex-row rounded-2xl overflow-hidden shadow-2xl bg-black/60 border border-white/10 backdrop-blur-xl"
                                >
                                    {/* Left: Media Area */}
                                    <div className="flex-none h-[50vh] md:h-auto md:flex-1 bg-black relative flex flex-col overflow-hidden group">
                                        {(() => {
                                            const allMedia = selectedItem ? [selectedItem.url, ...(selectedItem.additionalUrls || [])] : [];
                                            const currentUrl = allMedia[selectedMediaIndex] || '';
                                            return (
                                                <>
                                                    <div className="flex-1 flex items-center justify-center relative">
                                                        {selectedItem.mediaType === 'image' && (
                                                            <img
                                                                src={currentUrl}
                                                                alt={selectedItem.title}
                                                                className="w-full h-full object-contain transition-opacity duration-300"
                                                                onContextMenu={(e) => e.preventDefault()}
                                                            />
                                                        )}

                                                        {selectedItem.mediaType === 'video' && (
                                                            <video
                                                                src={currentUrl}
                                                                className="w-full h-full object-contain"
                                                                controls
                                                                autoPlay
                                                                controlsList="nodownload"
                                                                onContextMenu={(e) => e.preventDefault()}
                                                            />
                                                        )}

                                                        {selectedItem.mediaType === 'video_link' && getEmbedUrl(currentUrl) && (
                                                            <div className="w-full h-full">
                                                                <iframe
                                                                    src={`${getEmbedUrl(currentUrl)!}?autoplay=1`}
                                                                    className="w-full h-full border-0"
                                                                    allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                                                                    allowFullScreen
                                                                />
                                                            </div>
                                                        )}
                                                    </div>
                                                    
                                                    {/* Floating Album Thumbnails */}
                                                    {allMedia.length > 1 && (
                                                        <div className="absolute bottom-0 inset-x-0 p-4 md:p-6 bg-gradient-to-t from-black/90 via-black/50 to-transparent flex gap-3 overflow-x-auto custom-scrollbar transition-all duration-300">
                                                            {allMedia.map((url, idx) => (
                                                                <button
                                                                    key={idx}
                                                                    onClick={(e) => { e.stopPropagation(); setSelectedMediaIndex(idx); }}
                                                                    className={`relative flex-shrink-0 h-16 w-24 rounded-lg overflow-hidden border-2 transition-all duration-300 ${selectedMediaIndex === idx ? 'border-gold-500 scale-105 shadow-lg shadow-gold-500/20' : 'border-white/20 opacity-60 hover:opacity-100 hover:border-white/50'}`}
                                                                >
                                                                    {selectedItem.mediaType === 'video_link' && getYouTubeThumbnail(url) ? (
                                                                         <img src={getYouTubeThumbnail(url)!} className="w-full h-full object-cover" />
                                                                    ) : selectedItem.mediaType === 'video' && isVideoFile(url) ? (
                                                                         <video src={url} className="w-full h-full object-cover pointer-events-none" />
                                                                    ) : (
                                                                        <img src={url} className="w-full h-full object-cover" />
                                                                    )}
                                                                </button>
                                                            ))}
                                                        </div>
                                                    )}
                                                </>
                                            );
                                        })()}
                                    </div>

                                    {/* Right: Details Panel */}
                                    <div className="w-full md:w-96 flex flex-col bg-white/5 border-l border-white/10 overflow-y-auto custom-scrollbar relative">
                                        <div className="p-6 md:p-8 space-y-6 flex-1">
                                            {/* Metadata Badges */}
                                            <div className="flex flex-wrap items-center gap-2">
                                                <span className="bg-gold-500/20 text-gold-400 px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider flex items-center gap-1.5 border border-gold-500/20">
                                                    <Tag size={12} /> {selectedItem.category}
                                                </span>
                                                {isVideo(selectedItem) && (
                                                    <span className="bg-primary-500/20 text-primary-300 px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider flex items-center gap-1.5 border border-primary-500/20">
                                                        <Film size={12} /> Video
                                                    </span>
                                                )}
                                                <span className="text-white/40 text-[10px] uppercase font-bold tracking-wider flex items-center gap-1.5 ml-auto">
                                                    <Calendar size={12} /> {formatDate(selectedItem.createdAt)}
                                                </span>
                                            </div>

                                            {/* Title & Description */}
                                            <div>
                                                <h2 className="text-2xl font-heading font-bold text-white mb-3 leading-tight">
                                                    {selectedItem.title || 'Untitled'}
                                                </h2>
                                                
                                                {selectedItem.description && (
                                                    <p className="text-white/70 leading-relaxed text-sm whitespace-pre-line">
                                                        {selectedItem.description}
                                                    </p>
                                                )}
                                            </div>
                                        </div>

                                        {/* Related Media (Bottom pinned) */}
                                        {relatedItems.length > 0 && (
                                            <div className="p-6 border-t border-white/10 bg-black/40 mt-auto">
                                                <h3 className="text-xs font-bold text-white/50 uppercase tracking-wider mb-4">More from {selectedItem.category}</h3>
                                                <div className="grid grid-cols-3 gap-2">
                                                    {relatedItems.map(item => (
                                                        <div
                                                            key={item.id}
                                                            className="cursor-pointer group/related rounded-lg overflow-hidden aspect-square bg-gray-800 relative ring-1 ring-white/10 hover:ring-gold-500/50 transition-all"
                                                            onClick={() => setSelectedItem(item)}
                                                        >
                                                            {item.mediaType === 'image' ? (
                                                                <img src={item.url} alt={item.title} className="w-full h-full object-cover transition-transform duration-500 group-hover/related:scale-110" />
                                                            ) : item.mediaType === 'video_link' && getYouTubeThumbnail(item.url) ? (
                                                                <img src={getYouTubeThumbnail(item.url)!} alt={item.title} className="w-full h-full object-cover transition-transform duration-500 group-hover/related:scale-110" />
                                                            ) : (
                                                                <div className="w-full h-full flex items-center justify-center bg-primary-900">
                                                                    <Film size={16} className="text-gold-400/50" />
                                                                </div>
                                                            )}
                                                            {isVideo(item) && (
                                                                <div className="absolute inset-0 flex items-center justify-center bg-black/20 group-hover/related:bg-transparent transition-colors">
                                                                    <Play size={16} className="text-white drop-shadow-md" fill="currentColor" />
                                                                </div>
                                                            )}
                                                        </div>
                                                    ))}
                                                </div>
                                            </div>
                                        )}
                                    </div>
                                </motion.div>
                            </div>
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
};

export default Gallery;
