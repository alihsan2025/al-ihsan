import React, { useEffect, useState } from 'react';
import { useCloudinary } from '../../hooks/useCloudinary';
import { supabase } from '../../lib/supabase';
import EmptyState from '../../components/admin/EmptyState';
import ActionModal, { type ActionModalState } from '../../components/admin/ActionModal';
import {
    Upload, Plus, Search, Trash2, Image as ImageIcon, Video,
    Film, Link2, X, ShieldCheck, Filter, Edit2, AlertCircle
} from 'lucide-react';

type MediaType = 'image' | 'video' | 'video_link';
type FilterType = 'ALL' | 'image' | 'video' | 'video_link';

interface MediaItem {
    id: string;
    title: string;
    description: string;
    category: string;
    url: string;
    additionalUrls?: string[];
    mediaType: MediaType;
    createdAt: string;
    source: 'gallery' | 'videos';
}

const CATEGORIES = ['Food Relief', 'Medical', 'Education', 'Orphans', 'Events', 'General'];

const formatDate = (v: string) =>
    new Date(v).toLocaleString('en-GB', { day: 'numeric', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit' });

const isVideoUrl = (url: string) => /\.(mp4|webm|ogg)(\?.*)?$/i.test(url);


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

const MediaHubTab: React.FC = () => {
    const { uploadImage, uploading } = useCloudinary();

    // Upload form state
    const [title, setTitle] = useState('');
    const [description, setDescription] = useState('');
    const [category, setCategory] = useState('General');
    const [uploadType, setUploadType] = useState<'image' | 'video_upload' | 'video_link'>('image');
    const [files, setFiles] = useState<File[]>([]);
    const [videoLinkUrl, setVideoLinkUrl] = useState('');
    const [success, setSuccess] = useState(false);
    const [showForm, setShowForm] = useState(false);
    const [uploadError, setUploadError] = useState<string | null>(null);

    // View state
    const [viewingItem, setViewingItem] = useState<MediaItem | null>(null);
    const [viewingIndex, setViewingIndex] = useState(0);

    useEffect(() => {
        if (viewingItem) setViewingIndex(0);
    }, [viewingItem]);

    // Edit state
    const [editingItem, setEditingItem] = useState<MediaItem | null>(null);
    const [editTitle, setEditTitle] = useState('');
    const [editDesc, setEditDesc] = useState('');
    const [editCategory, setEditCategory] = useState('');
    const [editExistingUrls, setEditExistingUrls] = useState<string[]>([]);
    const [editNewFiles, setEditNewFiles] = useState<File[]>([]);

    // Library state
    const [items, setItems] = useState<MediaItem[]>([]);
    const [loading, setLoading] = useState(true);
    const [search, setSearch] = useState('');
    const [filter, setFilter] = useState<FilterType>('ALL');
    const [deleting] = useState<string | null>(null);

    // Confirmation modal
    const [modalState, setModalState] = useState<ActionModalState>('HIDDEN');
    const [modalConfig, setModalConfig] = useState({ title: '', message: '', isDanger: false, confirmText: 'Confirm', successMessage: '' });
    const [pendingAction, setPendingAction] = useState<(() => Promise<void>) | null>(null);

    useEffect(() => { void loadMedia(); }, []);

    const loadMedia = async () => {
        setLoading(true);
        try {
            const [galleryRes, videosRes] = await Promise.all([
                supabase.from('gallery').select('*').order('created_at', { ascending: false }),
                supabase.from('videos').select('*').order('created_at', { ascending: false }),
            ]);

            const galleryItems: MediaItem[] = (galleryRes.data ?? []).map((row: any) => ({
                id: row.id,
                title: row.title ?? '',
                description: row.description ?? '',
                category: row.category ?? 'General',
                url: row.url,
                additionalUrls: row.additional_urls || [],
                mediaType: (row.media_type === 'video' ? 'video' : 'image') as MediaType,
                createdAt: row.created_at,
                source: 'gallery' as const,
            }));

            const videoItems: MediaItem[] = (videosRes.data ?? []).map((row: any) => ({
                id: row.id,
                title: row.title ?? '',
                description: row.description ?? '',
                category: row.category ?? 'General',
                url: row.url,
                additionalUrls: row.additional_urls || [],
                mediaType: 'video_link' as MediaType,
                createdAt: row.created_at,
                source: 'videos' as const,
            }));

            setItems([...galleryItems, ...videoItems].sort((a, b) =>
                new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
            ));
        } catch (e) {
            console.error('Failed to load media:', e);
        } finally {
            setLoading(false);
        }
    };

    const handleUpload = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!title.trim()) return;
        setUploadError(null);

        try {
            if (uploadType === 'video_link') {
                if (!videoLinkUrl.trim()) return;
                const { error } = await supabase.from('videos').insert({
                    title: title.trim(),
                    description: description.trim(),
                    category,
                    url: videoLinkUrl.trim(),
                });
                if (error) throw error;
            } else {
                if (files.length === 0) return;
                
                // Upload all files
                const uploadedUrls: string[] = [];
                for (let i = 0; i < files.length; i++) {
                    const result = await uploadImage(files[i]);
                    if (!result || result.error) {
                        throw new Error(result?.error || `Failed to upload ${files[i].name}`);
                    }
                    uploadedUrls.push(result.url);
                }
                
                // Group them into a single insert
                const mainUrl = uploadedUrls[0];
                const additionalUrls = uploadedUrls.slice(1);
                
                const { error } = await supabase.from('gallery').insert({
                    title: title.trim(),
                    description: description.trim(),
                    category,
                    url: mainUrl,
                    additional_urls: additionalUrls,
                    media_type: uploadType === 'video_upload' ? 'video' : 'image',
                });
                
                if (error) throw error;
            }

            setSuccess(true);
            setTitle('');
            setDescription('');
            setFiles([]);
            setVideoLinkUrl('');
            setShowForm(false);
            await loadMedia();
            setTimeout(() => setSuccess(false), 3000);
        } catch (err: any) {
            console.error('Upload failed:', err);
            setUploadError(err.message || 'An error occurred during upload. Check file size limits.');
        }
    };

    const startEdit = (item: MediaItem) => {
        setEditingItem(item);
        setEditTitle(item.title);
        setEditDesc(item.description);
        setEditCategory(item.category);
        setEditExistingUrls([item.url, ...(item.additionalUrls || [])].filter(Boolean));
        setEditNewFiles([]);
    };

    const saveEdit = async () => {
        if (!editingItem) return;
        
        if (editExistingUrls.length === 0 && editNewFiles.length === 0) {
            setModalConfig(prev => ({ ...prev, title: 'Error', message: 'You must have at least one media item.' }));
            setModalState('ERROR');
            setTimeout(() => setModalState('HIDDEN'), 3000);
            return;
        }

        setModalState('LOADING');
        try {
            // Upload new files
            const newlyUploadedUrls: string[] = [];
            for (let i = 0; i < editNewFiles.length; i++) {
                const result = await uploadImage(editNewFiles[i]);
                if (!result || result.error) throw new Error(result?.error || 'Failed to upload new media');
                newlyUploadedUrls.push(result.url);
            }

            const combinedUrls = [...editExistingUrls, ...newlyUploadedUrls];
            const mainUrl = combinedUrls[0];
            const additionalUrls = combinedUrls.slice(1);

            const table = editingItem.source === 'videos' ? 'videos' : 'gallery';
            const { error } = await supabase.from(table)
                .update({ 
                    title: editTitle, 
                    description: editDesc, 
                    category: editCategory,
                    url: mainUrl,
                    additional_urls: additionalUrls
                })
                .eq('id', editingItem.id);
            if (error) throw error;
            
            setItems(prev => prev.map(i => i.id === editingItem.id ? { 
                ...i, 
                title: editTitle, 
                description: editDesc, 
                category: editCategory,
                url: mainUrl,
                additionalUrls: additionalUrls
            } : i));
            setEditingItem(null);
            setModalState('SUCCESS');
            setTimeout(() => setModalState('HIDDEN'), 1500);
        } catch (error: any) {
            console.error('Save edit failed', error);
            setModalConfig(prev => ({ ...prev, title: 'Error', message: error.message || 'Failed to save changes.' }));
            setModalState('ERROR');
            setTimeout(() => setModalState('HIDDEN'), 3000);
        }
    };

    const confirmDelete = (item: MediaItem) => {
        setModalConfig({
            title: 'Delete Media',
            message: `Permanently delete "${item.title}"? This cannot be undone.`,
            isDanger: true,
            confirmText: 'Delete',
            successMessage: 'Media deleted successfully.',
        });
        setPendingAction(() => async () => {
            const table = item.source === 'videos' ? 'videos' : 'gallery';
            const { error } = await supabase.from(table).delete().eq('id', item.id);
            if (error) throw error;
            setItems(prev => prev.filter(i => i.id !== item.id));
        });
        setModalState('CONFIRMATION');
    };

    const executeAction = async () => {
        if (!pendingAction) return;
        setModalState('LOADING');
        try {
            await pendingAction();
            setModalState('SUCCESS');
        } catch {
            setModalState('ERROR');
        }
    };

    const filtered = items.filter(item => {
        const matchesSearch = item.title.toLowerCase().includes(search.toLowerCase()) ||
            item.description.toLowerCase().includes(search.toLowerCase()) ||
            item.category.toLowerCase().includes(search.toLowerCase());
        const matchesFilter = filter === 'ALL' || item.mediaType === filter;
        return matchesSearch && matchesFilter;
    });

    const counts = {
        all: items.length,
        images: items.filter(i => i.mediaType === 'image').length,
        videos: items.filter(i => i.mediaType === 'video').length,
        links: items.filter(i => i.mediaType === 'video_link').length,
    };

    return (
        <div className="space-y-6">
            {/* Success Toast */}
            {success && (
                <div className="bg-emerald-50 dark:bg-emerald-500/10 border border-emerald-200 dark:border-emerald-500/20 text-emerald-700 dark:text-emerald-400 p-3 rounded-lg text-sm flex items-center gap-2">
                    <ShieldCheck size={16} /> Media published successfully.
                </div>
            )}

            {/* Summary Cards */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                <div className="bg-white dark:bg-[#111827] p-5 rounded-xl border border-slate-200 dark:border-white/10 shadow-sm">
                    <p className="text-xs text-slate-500 dark:text-slate-400 uppercase tracking-wider">Total Media</p>
                    <p className="text-3xl font-bold text-slate-900 dark:text-white mt-1">{counts.all}</p>
                </div>
                <div className="bg-white dark:bg-[#111827] p-5 rounded-xl border border-slate-200 dark:border-white/10 shadow-sm">
                    <div className="flex items-center gap-2 mb-1">
                        <ImageIcon size={14} className="text-blue-500" />
                        <p className="text-xs text-slate-500 dark:text-slate-400 uppercase tracking-wider">Images</p>
                    </div>
                    <p className="text-3xl font-bold text-blue-600 dark:text-blue-400 mt-1">{counts.images}</p>
                </div>
                <div className="bg-white dark:bg-[#111827] p-5 rounded-xl border border-slate-200 dark:border-white/10 shadow-sm">
                    <div className="flex items-center gap-2 mb-1">
                        <Film size={14} className="text-purple-500" />
                        <p className="text-xs text-slate-500 dark:text-slate-400 uppercase tracking-wider">Videos</p>
                    </div>
                    <p className="text-3xl font-bold text-purple-600 dark:text-purple-400 mt-1">{counts.videos}</p>
                </div>
                <div className="bg-white dark:bg-[#111827] p-5 rounded-xl border border-slate-200 dark:border-white/10 shadow-sm">
                    <div className="flex items-center gap-2 mb-1">
                        <Link2 size={14} className="text-amber-500" />
                        <p className="text-xs text-slate-500 dark:text-slate-400 uppercase tracking-wider">YT / Vimeo</p>
                    </div>
                    <p className="text-3xl font-bold text-amber-600 dark:text-amber-400 mt-1">{counts.links}</p>
                </div>
            </div>

            {/* Toolbar */}
            <div className="flex flex-col sm:flex-row gap-3 justify-between">
                <div className="relative flex-1 max-w-md">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 w-4 h-4" />
                    <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Search media..."
                        className="w-full pl-10 pr-4 py-2 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-[#1F2937] text-sm text-slate-900 dark:text-white outline-none focus:ring-2 focus:ring-primary-500 placeholder:text-slate-400" />
                </div>
                <div className="flex gap-2">
                    <div className="flex bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg overflow-hidden">
                        {([
                            { key: 'ALL', label: 'All', icon: Filter },
                            { key: 'image', label: 'Images', icon: ImageIcon },
                            { key: 'video', label: 'Videos', icon: Film },
                            { key: 'video_link', label: 'Links', icon: Link2 },
                        ] as const).map(f => (
                            <button key={f.key} onClick={() => setFilter(f.key)}
                                className={`flex items-center gap-1.5 px-3 py-2 text-xs font-bold transition ${filter === f.key
                                    ? 'bg-slate-900 dark:bg-slate-100 text-white dark:text-slate-900'
                                    : 'text-slate-500 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-700'
                                }`}>
                                <f.icon size={12} />
                                <span className="hidden sm:inline">{f.label}</span>
                            </button>
                        ))}
                    </div>
                    <button onClick={() => setShowForm(true)}
                        className="flex items-center gap-2 px-4 py-2 bg-primary-600 dark:bg-primary-500 text-white rounded-lg font-medium text-sm hover:bg-primary-700 transition shadow-sm">
                        <Plus size={16} /> Upload
                    </button>
                </div>
            </div>

            {/* Upload Form Modal */}
            {showForm && (
                <div className="bg-white dark:bg-[#111827] rounded-xl border border-slate-200 dark:border-white/10 shadow-sm p-6">
                    <div className="flex items-center justify-between mb-6">
                        <div>
                            <h3 className="text-lg font-bold text-slate-900 dark:text-white">Upload Media</h3>
                            <p className="text-sm text-slate-500 dark:text-slate-400 mt-0.5">Add images, videos, or YouTube/Vimeo links to the gallery.</p>
                        </div>
                        <button onClick={() => setShowForm(false)} className="text-slate-400 hover:text-slate-600 dark:hover:text-white transition"><X size={20} /></button>
                    </div>

                    {/* Media Type Selector */}
                    <div className="flex gap-2 mb-6">
                        {([
                            { key: 'image', label: 'Image', icon: ImageIcon, desc: 'JPG, PNG, WebP' },
                            { key: 'video_upload', label: 'Video File', icon: Film, desc: 'MP4, WebM' },
                            { key: 'video_link', label: 'Video Link', icon: Link2, desc: 'YouTube, Vimeo' },
                        ] as const).map(t => (
                            <button key={t.key} onClick={() => { setUploadType(t.key); setFiles([]); setVideoLinkUrl(''); setUploadError(null); }}
                                className={`flex-1 flex flex-col items-center gap-1.5 p-4 rounded-xl border-2 transition-all ${uploadType === t.key
                                    ? 'border-primary-500 bg-primary-50 dark:bg-primary-900/20 text-primary-700 dark:text-primary-400'
                                    : 'border-slate-200 dark:border-slate-700 text-slate-500 dark:text-slate-400 hover:border-slate-300'
                                }`}>
                                <t.icon size={20} />
                                <span className="text-xs font-bold">{t.label}</span>
                                <span className="text-[10px] opacity-70">{t.desc}</span>
                            </button>
                        ))}
                    </div>

                    <form onSubmit={handleUpload} className="space-y-4">
                        <div className="grid sm:grid-cols-2 gap-4">
                            <div>
                                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1.5">Title *</label>
                                <input required value={title} onChange={e => setTitle(e.target.value)}
                                    className="w-full px-3 py-2 bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-700 rounded-lg focus:ring-2 focus:ring-primary-500 outline-none text-sm text-slate-900 dark:text-white"
                                    placeholder="e.g. Ramadan Food Drive 2025" />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1.5">Category</label>
                                <select value={category} onChange={e => setCategory(e.target.value)}
                                    className="w-full px-3 py-2 bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-700 rounded-lg focus:ring-2 focus:ring-primary-500 outline-none text-sm text-slate-900 dark:text-white">
                                    {CATEGORIES.map(c => <option key={c} value={c}>{c}</option>)}
                                </select>
                            </div>
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1.5">Description</label>
                            <textarea value={description} onChange={e => setDescription(e.target.value)} rows={3}
                                className="w-full px-3 py-2 bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-700 rounded-lg focus:ring-2 focus:ring-primary-500 outline-none text-sm text-slate-900 dark:text-white resize-none"
                                placeholder="Describe this media item — what event, who's involved, the impact..." />
                        </div>

                        {/* File Upload or Link Input */}
                        {uploadType === 'video_link' ? (
                            <div>
                                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1.5">Video URL *</label>
                                <input required value={videoLinkUrl} onChange={e => setVideoLinkUrl(e.target.value)}
                                    className="w-full px-3 py-2 bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-700 rounded-lg focus:ring-2 focus:ring-primary-500 outline-none text-sm text-slate-900 dark:text-white"
                                    placeholder="https://www.youtube.com/watch?v=... or https://vimeo.com/..." />
                                {videoLinkUrl && getEmbedUrl(videoLinkUrl) && (
                                    <div className="mt-3 rounded-lg overflow-hidden border border-slate-200 dark:border-slate-700 aspect-video">
                                        <iframe src={getEmbedUrl(videoLinkUrl)!} className="w-full h-full" loading="lazy"
                                            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture" allowFullScreen />
                                    </div>
                                )}
                            </div>
                        ) : (
                            <div>
                                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1.5">Files *</label>
                                <div className="border-2 border-dashed border-slate-300 dark:border-slate-700 rounded-xl p-8 text-center hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors cursor-pointer relative group mb-4">
                                    <input required={files.length === 0} type="file" multiple onChange={e => setFiles(Array.from(e.target.files || []))}
                                        className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-10"
                                        accept={uploadType === 'image' ? 'image/*' : 'video/*'} />
                                    <Upload size={24} className={`mx-auto mb-3 transition-colors ${files.length > 0 ? 'text-emerald-500' : 'text-slate-400 group-hover:text-primary-500'}`} />
                                    <p className="text-sm font-bold text-slate-900 dark:text-slate-300">
                                        {files.length > 0 ? `${files.length} file(s) selected` : 'Click or drag files here'}
                                    </p>
                                    <p className="text-xs text-slate-500 dark:text-slate-400 font-medium mt-1">
                                        {uploadType === 'image' ? 'JPG, PNG, WebP · Up to 10MB' : 'MP4, WebM · Up to 100MB'}
                                    </p>
                                </div>
                                
                                {files.length > 0 && (
                                    <div className="grid grid-cols-4 sm:grid-cols-6 gap-2">
                                        {files.map((file, i) => (
                                            <div key={i} className="aspect-square rounded-lg overflow-hidden bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 relative">
                                                {file.type.startsWith('image/') ? (
                                                    <img src={URL.createObjectURL(file)} className="w-full h-full object-cover" alt="" />
                                                ) : (
                                                    <video src={URL.createObjectURL(file)} className="w-full h-full object-cover" />
                                                )}
                                            </div>
                                        ))}
                                    </div>
                                )}
                            </div>
                        )}

                        {uploadError && (
                            <div className="bg-red-50 dark:bg-red-500/10 border border-red-200 dark:border-red-500/20 text-red-700 dark:text-red-400 p-3 rounded-lg text-sm flex gap-2 items-start mt-4">
                                <AlertCircle size={16} className="mt-0.5 shrink-0" />
                                <div>
                                    <p className="font-bold">Upload Failed</p>
                                    <p className="text-xs mt-0.5">{uploadError}</p>
                                </div>
                            </div>
                        )}

                        <div className="flex justify-end gap-3 pt-4 border-t border-slate-100 dark:border-slate-800">
                            <button type="button" onClick={() => setShowForm(false)}
                                className="px-4 py-2.5 text-sm font-medium text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white transition">
                                Cancel
                            </button>
                            <button disabled={uploading || (uploadType !== 'video_link' && files.length === 0) || (uploadType === 'video_link' && !videoLinkUrl.trim())}
                                type="submit"
                                className="px-6 py-2.5 bg-primary-600 dark:bg-primary-500 text-white rounded-lg font-medium hover:bg-primary-700 disabled:opacity-50 transition-colors flex items-center gap-2 text-sm shadow-sm">
                                {uploading
                                    ? <><div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" /> Uploading...</>
                                    : <><Plus size={16} /> Publish Media</>
                                }
                            </button>
                        </div>
                    </form>
                </div>
            )}

            {/* Media Library Grid */}
            {loading ? (
                <div className="p-8 text-center text-slate-500 dark:text-slate-400">Loading media library...</div>
            ) : (
                <div className="bg-white dark:bg-[#111827] rounded-xl border border-slate-200 dark:border-white/10 shadow-sm overflow-hidden">
                    <div className="p-6 border-b border-slate-100 dark:border-white/10">
                        <h2 className="text-lg font-bold text-slate-900 dark:text-white">Media Library</h2>
                        <p className="text-sm text-slate-500 dark:text-slate-400 mt-0.5">{filtered.length} item{filtered.length !== 1 ? 's' : ''} · Gallery images, uploaded videos, and linked videos.</p>
                    </div>

                    {filtered.length === 0 ? (
                        <EmptyState title="No media found" message={search || filter !== 'ALL' ? 'Try adjusting your filters.' : 'Upload your first image or video to get started.'}
                            icon={ImageIcon} action={!search && filter === 'ALL' ? { label: 'Upload Media', onClick: () => setShowForm(true) } : undefined} />
                    ) : (
                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 bg-slate-100 dark:bg-transparent">
                            {filtered.map(item => (
                                <div key={`${item.source}-${item.id}`} className="bg-white dark:bg-[#111827] p-4 group cursor-pointer hover:ring-2 hover:ring-primary-500 transition-all rounded-lg shadow-sm border border-slate-200 dark:border-slate-800" onClick={() => setViewingItem(item)}>
                                    {/* Thumbnail */}
                                    <div className="aspect-video rounded-lg overflow-hidden bg-slate-100 dark:bg-slate-800 mb-3 relative">
                                        {item.mediaType === 'image' ? (
                                            <img src={item.url} alt={item.title} className="w-full h-full object-cover" />
                                        ) : item.mediaType === 'video' && isVideoUrl(item.url) ? (
                                            <video src={item.url} className="w-full h-full object-cover" preload="metadata" />
                                        ) : item.mediaType === 'video_link' && getEmbedUrl(item.url) ? (
                                            <iframe src={getEmbedUrl(item.url)!} className="w-full h-full pointer-events-none" loading="lazy" />
                                        ) : (
                                            <div className="w-full h-full flex items-center justify-center text-slate-400">
                                                <Video size={32} />
                                            </div>
                                        )}
                                        {/* Type Badge */}
                                        <div className={`absolute top-2 left-2 flex items-center gap-1 px-2 py-1 rounded-md text-[10px] font-bold uppercase tracking-wider backdrop-blur-sm ${
                                            item.mediaType === 'image'
                                                ? 'bg-blue-500/80 text-white'
                                                : item.mediaType === 'video'
                                                    ? 'bg-purple-500/80 text-white'
                                                    : 'bg-amber-500/80 text-white'
                                        }`}>
                                            {item.mediaType === 'image' ? <ImageIcon size={10} /> : item.mediaType === 'video' ? <Film size={10} /> : <Link2 size={10} />}
                                            {item.mediaType === 'image' ? 'Image' : item.mediaType === 'video' ? 'Video' : 'Link'}
                                        </div>
                                    </div>

                                    {/* Info */}
                                    <div className="flex-1 flex flex-col items-center text-center px-1">
                                        <h3 className="font-bold text-sm text-slate-900 dark:text-white line-clamp-1">{item.title}</h3>
                                        {item.description && (
                                            <p className="text-xs text-slate-500 dark:text-slate-400 mt-1 line-clamp-2">{item.description}</p>
                                        )}
                                        
                                        <div className="mt-3 flex items-center gap-2">
                                            {item.category !== 'General' && (
                                                <span className="text-[10px] font-bold uppercase tracking-wider bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 px-2 py-0.5 rounded">
                                                    {item.category}
                                                </span>
                                            )}
                                            <span className="text-[10px] text-slate-400">{formatDate(item.createdAt)}</span>
                                        </div>

                                        <div className="w-full mt-4 flex items-center justify-between border-t border-slate-100 dark:border-slate-800 pt-3">
                                            <div className="text-xs font-bold text-primary-600 dark:text-primary-400 flex items-center gap-1.5 hover:text-primary-700 transition-colors cursor-pointer">
                                                <Search size={14} /> View Details
                                            </div>
                                            <div className="flex items-center gap-1" onClick={e => e.stopPropagation()}>
                                                <button onClick={() => startEdit(item)}
                                                    className="p-1.5 text-slate-400 hover:text-blue-600 hover:bg-slate-100 dark:hover:bg-slate-800 transition rounded" title="Edit">
                                                    <Edit2 size={14} />
                                                </button>
                                                <button onClick={() => confirmDelete(item)} disabled={deleting === item.id}
                                                    className="p-1.5 text-slate-400 hover:text-red-600 hover:bg-slate-100 dark:hover:bg-slate-800 transition rounded disabled:opacity-50" title="Delete">
                                                    <Trash2 size={14} />
                                                </button>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </div>
            )}
            <ActionModal isOpen={modalState !== 'HIDDEN'} state={modalState} title={modalConfig.title} message={modalConfig.message} isDanger={modalConfig.isDanger} confirmText={modalConfig.confirmText} successMessage={modalConfig.successMessage} onConfirm={executeAction} onClose={() => setModalState('HIDDEN')} />

            {/* Edit Modal */}
            {editingItem && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/90 backdrop-blur-sm overflow-y-auto">
                    <div className="bg-white dark:bg-[#111827] rounded-2xl w-full max-w-4xl shadow-2xl border border-slate-200 dark:border-white/10 overflow-hidden my-8 flex flex-col md:flex-row">
                        
                        {/* Left: Media Manager */}
                        <div className="w-full md:w-1/2 border-b md:border-b-0 md:border-r border-slate-200 dark:border-white/10 bg-slate-50 dark:bg-black/20 p-5 overflow-y-auto max-h-[50vh] md:max-h-[80vh] custom-scrollbar">
                            <div className="flex justify-between items-center mb-4">
                                <h3 className="font-bold text-slate-900 dark:text-white">Manage Media</h3>
                                <div className="text-xs text-slate-500 dark:text-slate-400 font-medium bg-slate-200 dark:bg-white/10 px-2 py-1 rounded">
                                    {editExistingUrls.length + editNewFiles.length} item{editExistingUrls.length + editNewFiles.length !== 1 ? 's' : ''}
                                </div>
                            </div>
                            
                            <div className="grid grid-cols-2 gap-3 mb-4">
                                {/* Existing Media */}
                                {editExistingUrls.map((url, idx) => (
                                    <div key={`existing-${idx}`} className="relative aspect-square bg-slate-200 dark:bg-slate-800 rounded-lg overflow-hidden border border-slate-200 dark:border-white/10 group">
                                        {editingItem.mediaType === 'video_link' && getYouTubeThumbnail(url) ? (
                                             <img src={getYouTubeThumbnail(url)!} className="w-full h-full object-cover" />
                                        ) : editingItem.mediaType === 'video' && isVideoUrl(url) ? (
                                             <video src={url} className="w-full h-full object-cover pointer-events-none" />
                                        ) : (
                                             <img src={url} className="w-full h-full object-cover" />
                                        )}
                                        <button onClick={() => setEditExistingUrls(prev => prev.filter((_, i) => i !== idx))} className="absolute top-1 right-1 bg-red-500 hover:bg-red-600 text-white p-1 rounded-md opacity-0 group-hover:opacity-100 transition-opacity shadow-lg">
                                            <Trash2 size={14} />
                                        </button>
                                        {idx === 0 && (
                                            <div className="absolute bottom-1 left-1 bg-blue-500 text-white text-[9px] font-bold px-1.5 py-0.5 rounded uppercase tracking-wider shadow">Primary</div>
                                        )}
                                    </div>
                                ))}

                                {/* New Files */}
                                {editNewFiles.map((file, idx) => (
                                    <div key={`new-${idx}`} className="relative aspect-square bg-slate-200 dark:bg-slate-800 rounded-lg overflow-hidden border-2 border-dashed border-primary-500 group">
                                        {file.type.startsWith('video/') ? (
                                            <video src={URL.createObjectURL(file)} className="w-full h-full object-cover pointer-events-none" />
                                        ) : (
                                            <img src={URL.createObjectURL(file)} className="w-full h-full object-cover" />
                                        )}
                                        <button onClick={() => setEditNewFiles(prev => prev.filter((_, i) => i !== idx))} className="absolute top-1 right-1 bg-red-500 hover:bg-red-600 text-white p-1 rounded-md opacity-0 group-hover:opacity-100 transition-opacity shadow-lg">
                                            <Trash2 size={14} />
                                        </button>
                                        <div className="absolute inset-x-0 bottom-0 bg-primary-500/80 backdrop-blur-sm text-white text-[10px] font-bold px-1.5 py-1 text-center truncate">
                                            New: {file.name}
                                        </div>
                                    </div>
                                ))}

                                {/* Add Button */}
                                {editingItem.mediaType !== 'video_link' && (
                                    <label className="relative aspect-square bg-white dark:bg-slate-800 rounded-lg overflow-hidden border-2 border-dashed border-slate-300 dark:border-slate-600 hover:border-primary-500 dark:hover:border-primary-500 transition-colors flex flex-col items-center justify-center cursor-pointer text-slate-500 hover:text-primary-600 dark:text-slate-400 dark:hover:text-primary-400">
                                        <Plus size={24} className="mb-2" />
                                        <span className="text-xs font-medium">Add More</span>
                                        <input type="file" multiple accept={editingItem.mediaType === 'video' ? 'video/*' : 'image/*'} className="hidden" onChange={(e) => {
                                            if (e.target.files) {
                                                setEditNewFiles(prev => [...prev, ...Array.from(e.target.files!)]);
                                            }
                                        }} />
                                    </label>
                                )}
                            </div>
                            {editingItem.mediaType === 'video_link' && (
                                <div className="text-xs text-amber-600 dark:text-amber-400 bg-amber-50 dark:bg-amber-500/10 p-3 rounded-lg flex items-start gap-2">
                                    <AlertCircle size={14} className="mt-0.5 shrink-0" />
                                    <p>Additional media cannot be added to Video Link posts. Please delete and recreate if you need a different link.</p>
                                </div>
                            )}
                        </div>

                        {/* Right: Metadata */}
                        <div className="w-full md:w-1/2 flex flex-col max-h-[80vh]">
                            <div className="p-5 border-b border-slate-100 dark:border-white/5 flex justify-between items-center bg-white dark:bg-[#111827]">
                                <h3 className="font-bold text-slate-900 dark:text-white">Edit Post Details</h3>
                                <button onClick={() => setEditingItem(null)} className="text-slate-400 hover:text-slate-600 dark:hover:text-white bg-slate-100 dark:bg-white/5 p-1.5 rounded-full"><X size={18} /></button>
                            </div>
                            
                            <div className="p-6 space-y-5 overflow-y-auto flex-1 bg-white dark:bg-[#111827] custom-scrollbar">
                                <div>
                                    <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1.5">Title</label>
                                    <input value={editTitle} onChange={e => setEditTitle(e.target.value)}
                                        className="w-full px-3 py-2 bg-slate-50 dark:bg-black/20 border border-slate-300 dark:border-white/10 rounded-lg focus:ring-2 focus:ring-primary-500 outline-none text-sm text-slate-900 dark:text-white placeholder:text-slate-400" placeholder="Enter title..." />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1.5">Category</label>
                                    <select value={editCategory} onChange={e => setEditCategory(e.target.value)}
                                        className="w-full px-3 py-2 bg-slate-50 dark:bg-black/20 border border-slate-300 dark:border-white/10 rounded-lg focus:ring-2 focus:ring-primary-500 outline-none text-sm text-slate-900 dark:text-white">
                                        {CATEGORIES.map(c => <option key={c} value={c}>{c}</option>)}
                                    </select>
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1.5">Description</label>
                                    <textarea value={editDesc} onChange={e => setEditDesc(e.target.value)} rows={6}
                                        className="w-full px-3 py-2 bg-slate-50 dark:bg-black/20 border border-slate-300 dark:border-white/10 rounded-lg focus:ring-2 focus:ring-primary-500 outline-none text-sm text-slate-900 dark:text-white resize-none placeholder:text-slate-400" placeholder="Enter detailed description..." />
                                </div>
                            </div>

                            <div className="p-5 border-t border-slate-100 dark:border-white/5 flex justify-end gap-3 bg-slate-50 dark:bg-black/20">
                                <button onClick={() => setEditingItem(null)}
                                    className="px-4 py-2 font-medium text-sm text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white transition-colors">Cancel</button>
                                <button onClick={saveEdit} disabled={modalState === 'LOADING'}
                                    className="px-6 py-2 font-medium text-sm text-white bg-primary-600 hover:bg-primary-700 rounded-lg flex items-center gap-2 disabled:opacity-50 transition-colors shadow-sm shadow-primary-500/20">
                                    {modalState === 'LOADING' ? <><div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" /> Saving...</> : 'Save Changes'}
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            )}

            {/* Full Details View Modal */}
            {viewingItem && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/90 backdrop-blur-sm overflow-y-auto" onClick={() => setViewingItem(null)}>
                    <div className="w-full max-w-7xl h-[85vh] flex flex-col md:flex-row rounded-2xl overflow-hidden shadow-2xl bg-black/60 border border-white/10 backdrop-blur-xl" onClick={e => e.stopPropagation()}>
                        
                        {/* Left: Media Area */}
                        <div className="flex-none h-[50vh] md:h-auto md:flex-1 bg-black relative flex flex-col overflow-hidden group">
                            <div className="absolute top-4 left-4 z-10 flex gap-2">
                                <button onClick={() => setViewingItem(null)} className="text-white/60 hover:text-white bg-black/50 p-2 rounded-full transition-colors backdrop-blur-md">
                                    <X size={20} />
                                </button>
                            </div>

                            {(() => {
                                const allMedia = [viewingItem.url, ...(viewingItem.additionalUrls || [])];
                                const currentUrl = allMedia[viewingIndex] || '';
                                return (
                                    <>
                                        <div className="flex-1 flex items-center justify-center relative">
                                            {viewingItem.mediaType === 'image' && (
                                                <img src={currentUrl} alt={viewingItem.title} className="w-full h-full object-contain transition-opacity duration-300" />
                                            )}
                                            {viewingItem.mediaType === 'video' && (
                                                <video src={currentUrl} className="w-full h-full object-contain" controls autoPlay controlsList="nodownload" />
                                            )}
                                            {viewingItem.mediaType === 'video_link' && getEmbedUrl(currentUrl) && (
                                                <div className="w-full h-full">
                                                    <iframe src={`${getEmbedUrl(currentUrl)!}?autoplay=1`} className="w-full h-full border-0" allowFullScreen allow="autoplay" />
                                                </div>
                                            )}
                                        </div>
                                        
                                        {/* Floating Album Thumbnails */}
                                        {allMedia.length > 1 && (
                                            <div className="absolute bottom-0 inset-x-0 p-4 md:p-6 bg-gradient-to-t from-black/90 via-black/50 to-transparent flex gap-3 overflow-x-auto custom-scrollbar transition-all duration-300">
                                                {allMedia.map((url, idx) => (
                                                    <button key={idx} onClick={() => setViewingIndex(idx)}
                                                        className={`relative flex-shrink-0 h-16 w-24 rounded-lg overflow-hidden border-2 transition-all duration-300 ${viewingIndex === idx ? 'border-primary-500 scale-105 shadow-lg shadow-primary-500/20' : 'border-white/20 opacity-60 hover:opacity-100 hover:border-white/50'}`}>
                                                        {viewingItem.mediaType === 'video_link' && getYouTubeThumbnail(url) ? (
                                                                <img src={getYouTubeThumbnail(url)!} className="w-full h-full object-cover" />
                                                        ) : viewingItem.mediaType === 'video' && isVideoUrl(url) ? (
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
                        <div className="w-full md:w-96 flex flex-col bg-white/5 border-l border-white/10 overflow-y-auto custom-scrollbar">
                            <div className="p-6 md:p-8 space-y-6 flex-1">
                                <div className="flex flex-wrap items-center gap-2">
                                    <span className="bg-primary-500/20 text-primary-300 px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider border border-primary-500/20">
                                        {viewingItem.category}
                                    </span>
                                    <span className="text-white/40 text-[10px] uppercase font-bold tracking-wider ml-auto">
                                        {formatDate(viewingItem.createdAt)}
                                    </span>
                                </div>
                                
                                <div>
                                    <h2 className="text-2xl font-heading font-bold text-white mb-3 leading-tight">
                                        {viewingItem.title || 'Untitled'}
                                    </h2>
                                    {viewingItem.description ? (
                                        <p className="text-white/70 leading-relaxed text-sm whitespace-pre-line">
                                            {viewingItem.description}
                                        </p>
                                    ) : (
                                        <p className="text-white/40 italic text-sm">No description provided.</p>
                                    )}
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default MediaHubTab;
