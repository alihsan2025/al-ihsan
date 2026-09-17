import React, { useEffect, useState } from 'react';
import { getContentPosts, createContentPost, updateContentPost, deleteContentPost, publishPostToFacebook, type ContentPost, type ContentInput, type ContentStatus, type ContentCategory } from '../../lib/contentService';
import StatusBadge from '../../components/admin/StatusBadge';
import EmptyState from '../../components/admin/EmptyState';
import FormField from '../../components/admin/FormField';
import FacebookPreview from '../../components/admin/social/FacebookPreview';
import { CONTENT_TEMPLATES, CALLS_TO_ACTION, STANDARD_SIGNATURE } from '../../components/admin/social/TemplateData';
import { useCloudinary } from '../../hooks/useCloudinary';
import { Plus, X, FileText, Trash2, LayoutTemplate, Layers, Calendar, Sparkles, Copy, XCircle, CheckCircle, Image as ImageIcon } from 'lucide-react';

const formatDate = (v: string) => new Date(v).toLocaleString('en-GB', { day: 'numeric', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit' });

const ContentTab: React.FC = () => {
    const [posts, setPosts] = useState<ContentPost[]>([]);
    const [loading, setLoading] = useState(true);
    const [viewMode, setViewMode] = useState<'LIST' | 'EDITOR'>('LIST');
    const [copied, setCopied] = useState(false);
    const [publishing, setPublishing] = useState(false);
    // Editor State
    const [form, setForm] = useState<ContentInput>({ title: '', body: '', status: 'DRAFT', category: 'UPDATE', mediaUrls: [] });
    const [editingId, setEditingId] = useState<string | null>(null);

    const { uploadImage, uploading } = useCloudinary();

    useEffect(() => { void load(); }, []);

    const load = async () => {
        setLoading(true);
        try { setPosts(await getContentPosts()); } catch (e) { console.error(e); } finally { setLoading(false); }
    };

    const handleSave = async (status: ContentStatus) => {
        if (!form.title) return alert("Please provide an internal title for this post.");
        const payload = { ...form, status };
        
        try {
            if (editingId) {
                await updateContentPost(editingId, payload);
            } else {
                await createContentPost(payload);
            }
            setViewMode('LIST');
            resetForm();
            await load();
        } catch (e) {
            console.error(e);
            alert("Error saving post.");
        }
    };

    const handlePublishToFacebook = async () => {
        if (!form.title) return alert("Please provide an internal title for this post.");
        if (!form.body) return alert("You cannot publish an empty post.");
        
        setPublishing(true);
        try {
            await publishPostToFacebook(form.body, form.mediaUrls || []);
            
            const payload = { ...form, status: 'PUBLISHED' as ContentStatus };
            if (editingId) {
                await updateContentPost(editingId, payload);
            } else {
                await createContentPost(payload);
            }
            
            alert("Successfully published live to Facebook!");
            setViewMode('LIST');
            resetForm();
            await load();
        } catch (e: any) {
            console.error(e);
            alert("Error publishing to Facebook: " + e.message);
        } finally {
            setPublishing(false);
        }
    };



    const handleDelete = async (id: string, e?: React.MouseEvent) => {
        if (e) e.stopPropagation();
        if (!confirm('Delete this post?')) return;
        await deleteContentPost(id);
        setPosts(prev => prev.filter(p => p.id !== id));
    };

    const openEditor = (post?: ContentPost) => {
        if (post) {
            setEditingId(post.id);
            setForm({
                title: post.title,
                body: post.body,
                status: post.status,
                category: post.category,
                mediaUrls: post.mediaUrls || (post.imageUrl ? [post.imageUrl] : []),
                scheduledAt: post.scheduledAt
            });
        } else {
            resetForm();
        }
        setViewMode('EDITOR');
    };

    const resetForm = () => {
        setEditingId(null);
        setCopied(false);
        setForm({ title: '', body: '', status: 'DRAFT', category: 'UPDATE', mediaUrls: [] });
    };

    const handleApplyTemplate = (e: React.ChangeEvent<HTMLSelectElement>) => {
        const t = CONTENT_TEMPLATES.find(t => t.id === e.target.value);
        if (t) {
            setForm(prev => ({
                ...prev,
                category: t.category as ContentCategory,
                body: t.content
            }));
        }
    };

    const appendCTA = (e: React.ChangeEvent<HTMLSelectElement>) => {
        const cta = CALLS_TO_ACTION.find(c => c.id === e.target.value);
        if (cta && form.body !== undefined) {
            setForm(prev => ({ ...prev, body: prev.body + cta.text }));
        }
    };

    const appendSignature = () => {
        setForm(prev => ({ ...prev, body: (prev.body || '') + STANDARD_SIGNATURE }));
    };

    const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
        if (!e.target.files?.length) return;
        
        let newUrls = [...(form.mediaUrls || [])];
        for (let i = 0; i < e.target.files.length; i++) {
            const file = e.target.files[i];
            const data = await uploadImage(file);
            if (data?.url) newUrls.push(data.url);
        }
        setForm(prev => ({ ...prev, mediaUrls: newUrls }));
    };

    const removeImage = (index: number) => {
        setForm(prev => ({ ...prev, mediaUrls: (prev.mediaUrls || []).filter((_, i) => i !== index) }));
    };

    const copyToClipboard = async () => {
        if (!form.body) return;
        try {
            await navigator.clipboard.writeText(form.body);
            setCopied(true);
            setTimeout(() => setCopied(false), 3000);
        } catch (err) {
            console.error('Failed to copy text', err);
        }
    };

    if (loading) return <div className="p-8 text-center text-slate-500 dark:text-slate-400">Loading content modules...</div>;

    if (viewMode === 'EDITOR') {
        return (
            <div className="flex flex-col lg:flex-row gap-6 h-[calc(100vh-140px)] w-full overflow-hidden">
                {/* Left Side: Editor */}
                <div className="flex-1 flex flex-col bg-white dark:bg-[#111827] rounded-xl border border-slate-200 dark:border-white/10 shadow-sm overflow-hidden h-full">
                    <div className="p-4 border-b border-slate-200 dark:border-white/5 flex items-center justify-between bg-slate-50 dark:bg-slate-800/50">
                        <h3 className="text-base font-bold text-slate-900 dark:text-white flex items-center gap-2">
                            <Sparkles size={16} className="text-primary-600" />
                            {editingId ? 'Edit Social Post' : 'Build New Post'}
                        </h3>
                        <div className="flex items-center gap-2">
                            <button onClick={() => setViewMode('LIST')} className="p-1.5 text-slate-400 hover:text-slate-600 transition"><X size={20} /></button>
                        </div>
                    </div>

                    <div className="p-5 overflow-y-auto w-full flex-1 space-y-5 custom-scrollbar">
                        {/* Title & Category Row */}
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                            <FormField label="Internal Title (For Dashboard)" name="title" value={form.title} onChange={e => setForm(p => ({ ...p, title: e.target.value }))} required placeholder="e.g. Ramadan Appeal Day 1" />
                            <FormField label="Campaign Category" name="category" type="select" value={form.category || 'UPDATE'} onChange={e => setForm(p => ({ ...p, category: e.target.value as ContentCategory }))} 
                                options={['AWARENESS', 'APPEAL', 'UPDATE', 'APPRECIATION', 'ANNOUNCEMENT', 'ENGAGEMENT'].map(v => ({ value: v, label: v }))} />
                        </div>

                        {/* CMS Tools */}
                        <div className="p-4 bg-slate-50 dark:bg-slate-800/50 rounded-lg border border-slate-200 dark:border-white/5 space-y-4">
                            <div className="flex items-center gap-2 mb-2">
                                <LayoutTemplate size={16} className="text-slate-500" />
                                <span className="text-sm font-bold text-slate-700 dark:text-slate-300">Rapid Generators</span>
                            </div>
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                                <div>
                                    <label className="block text-[11px] font-bold text-slate-500 uppercase tracking-widest mb-1.5">Load Template</label>
                                    <select onChange={handleApplyTemplate} defaultValue="" className="w-full h-10 px-3 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-lg text-sm text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-primary-500">
                                        <option value="" disabled>-- Select a template to start --</option>
                                        {CONTENT_TEMPLATES.map(t => <option key={t.id} value={t.id}>{t.name}</option>)}
                                    </select>
                                </div>
                                <div>
                                    <label className="block text-[11px] font-bold text-slate-500 uppercase tracking-widest mb-1.5">Inject Action (CTA)</label>
                                    <select onChange={appendCTA} defaultValue="" className="w-full h-10 px-3 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-lg text-sm text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-primary-500">
                                        <option value="" disabled>-- Add call to action to post --</option>
                                        {CALLS_TO_ACTION.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
                                    </select>
                                </div>
                            </div>
                            <div className="flex justify-end pt-1">
                                <button type="button" onClick={appendSignature} className="text-xs font-semibold text-primary-600 dark:text-primary-400 hover:text-primary-700 transition">
                                    + Append Official Signature
                                </button>
                            </div>
                        </div>

                        {/* Main Body */}
                        <div>
                            <div className="flex justify-between items-center mb-1.5">
                                <label className="block text-[11px] font-bold text-slate-500 uppercase tracking-widest">Post Body / Caption</label>
                                <span className={`text-[11px] font-medium ${form.body?.length && form.body.length > 2200 ? 'text-amber-500' : 'text-slate-400'}`}>
                                    {form.body?.length || 0} chars (Max 2200 recommended)
                                </span>
                            </div>
                            <textarea
                                value={form.body || ''}
                                onChange={e => setForm(p => ({ ...p, body: e.target.value }))}
                                rows={10}
                                className="w-full p-4 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-lg text-sm text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-primary-500 transition resize-y font-sans leading-relaxed"
                                placeholder="Write your post content here. Spacing and emojis will be perfectly preserved for Facebook & WhatsApp..."
                            />
                        </div>

                        {/* Media Upload */}
                        <div>
                            <label className="block text-[11px] font-bold text-slate-500 uppercase tracking-widest mb-2">Media Files (Carousel)</label>
                            
                            {form.mediaUrls && form.mediaUrls.length > 0 && (
                                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-4">
                                    {form.mediaUrls.map((url, i) => (
                                        <div key={i} className="relative aspect-square rounded-lg border border-slate-200 dark:border-slate-700 overflow-hidden group">
                                            <img src={url} alt="Upload" className="w-full h-full object-cover" />
                                            <button type="button" onClick={() => removeImage(i)} className="absolute top-1 right-1 p-1 bg-red-500 text-white rounded-md opacity-0 group-hover:opacity-100 transition">
                                                <XCircle size={14} />
                                            </button>
                                        </div>
                                    ))}
                                </div>
                            )}

                            <label className={`w-full flex flex-col items-center justify-center p-6 border-2 border-dashed rounded-xl cursor-pointer transition ${uploading ? 'opacity-50 pointer-events-none border-slate-300' : 'border-slate-300 hover:border-primary-500 dark:border-slate-700 dark:hover:border-primary-500 bg-slate-50 dark:bg-slate-800/30'}`}>
                                <ImageIcon size={28} className="text-slate-400 mb-2" />
                                <span className="text-sm font-bold text-slate-700 dark:text-slate-300">
                                    {uploading ? 'Uploading...' : 'Upload Images / Flyers'}
                                </span>
                                <span className="text-xs text-slate-500 mt-1">Supports multiple files for Facebook carousels</span>
                                <input type="file" multiple accept="image/*" onChange={handleImageUpload} className="hidden" />
                            </label>
                        </div>
                    </div>

                    <div className="p-4 border-t border-slate-200 dark:border-white/5 bg-slate-50 dark:bg-slate-800/50 flex flex-wrap justify-between items-center gap-3">
                        <button type="button" onClick={() => handleSave('DRAFT')} className="px-5 py-2.5 bg-white dark:bg-slate-700 border border-slate-200 dark:border-slate-600 text-slate-700 dark:text-white shadow-sm rounded-lg font-bold text-sm hover:bg-slate-50 transition">
                            Save as Draft
                        </button>
                        <div className="flex items-center gap-2">
                            <button type="button" onClick={() => handleSave('PUBLISHED')} className="hidden sm:block px-5 py-2.5 bg-slate-200 dark:bg-slate-700 text-slate-700 dark:text-slate-300 shadow-sm rounded-lg font-bold text-sm hover:bg-slate-300 dark:hover:bg-slate-600 transition">
                                Mark as Published
                            </button>
                            <button type="button" onClick={handlePublishToFacebook} disabled={publishing} className={`px-5 py-2.5 bg-[#1877F2] text-white shadow-sm rounded-lg font-bold text-sm flex items-center gap-2 ${publishing ? 'opacity-70 cursor-not-allowed' : 'hover:bg-[#166fe5]'} transition`}>
                                {publishing ? 'Publishing via Meta API...' : 'Publish Live to Facebook'}
                            </button>
                        </div>
                    </div>
                </div>

                {/* Right Side: Preview Engine */}
                <div className="lg:w-[420px] w-full flex-shrink-0 h-full hidden md:block">
                    <FacebookPreview 
                        text={form.body || ''} 
                        mediaUrls={form.mediaUrls || []} 
                        copied={copied}
                        onCopy={copyToClipboard}
                    />
                </div>
            </div>
        );
    }

    return (
        <div className="space-y-6">
            <div className="flex justify-between items-center">
                <div>
                    <h2 className="text-xl font-bold text-slate-900 dark:text-white">Social Dispatch System</h2>
                    <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">Draft, refine, and dispatch beautifully structured social media posts.</p>
                </div>
                <button onClick={() => openEditor()} className="flex items-center gap-2 px-4 py-2 bg-primary-600 dark:bg-primary-500 text-white rounded-lg font-bold text-sm hover:bg-primary-700 transition shadow-sm">
                    <Plus size={16} /> New Post
                </button>
            </div>

            <div className="grid sm:grid-cols-4 gap-4 mb-2">
                <div className="bg-white dark:bg-[#111827] p-4 rounded-xl border border-slate-200 dark:border-white/10 shadow-sm flex items-center justify-between">
                    <div><p className="text-xs text-slate-500 dark:text-slate-400 uppercase font-bold tracking-wider">Total Dispatched</p><p className="text-2xl font-bold text-slate-900 dark:text-white mt-1">{posts.filter(p => p.status === 'PUBLISHED').length}</p></div>
                    <div className="w-10 h-10 rounded-full bg-emerald-100 text-emerald-600 flex items-center justify-center"><CheckCircle size={20} /></div>
                </div>
                <div className="bg-white dark:bg-[#111827] p-4 rounded-xl border border-slate-200 dark:border-white/10 shadow-sm flex items-center justify-between">
                    <div><p className="text-xs text-slate-500 dark:text-slate-400 uppercase font-bold tracking-wider">Active Drafts</p><p className="text-2xl font-bold text-slate-900 dark:text-white mt-1">{posts.filter(p => p.status === 'DRAFT').length}</p></div>
                    <div className="w-10 h-10 rounded-full bg-amber-100 text-amber-600 flex items-center justify-center"><FileText size={20} /></div>
                </div>
            </div>

            <div className="bg-white dark:bg-[#111827] rounded-xl border border-slate-200 dark:border-white/10 shadow-sm">
                <div className="divide-y divide-slate-100 dark:divide-white/5">
                    {posts.length === 0 ? (
                        <EmptyState title="No posts generated yet" message="Start building campaigns using rapid templates." icon={Layers} action={{ label: 'Launch Editor', onClick: () => openEditor() }} />
                    ) : posts.map(p => (
                        <div key={p.id} onClick={() => openEditor(p)} className="p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-4 hover:bg-slate-50 border-l-[3px] border-transparent hover:border-primary-500 dark:hover:bg-slate-800/50 cursor-pointer transition-colors">
                            <div className="flex-1 min-w-0">
                                <div className="flex items-center gap-3">
                                    <h3 className="font-bold text-slate-900 dark:text-white truncate max-w-sm">{p.title}</h3>
                                    <StatusBadge status={p.status} />
                                    <span className="px-2 py-0.5 rounded-md bg-slate-100 text-slate-600 text-[10px] font-bold tracking-wide uppercase">{p.category}</span>
                                </div>
                                {p.body && <p className="text-sm text-slate-500 dark:text-slate-400 mt-1.5 truncate max-w-2xl">{p.body.replace(/\n/g, ' ')}</p>}
                                <div className="flex items-center gap-4 mt-2">
                                    <p className="text-[11px] text-slate-400 dark:text-slate-500 flex items-center gap-1"><Calendar size={12} /> {formatDate(p.createdAt)}</p>
                                    {p.mediaUrls && p.mediaUrls.length > 0 && (
                                        <p className="text-[11px] text-slate-400 dark:text-slate-500 flex items-center gap-1"><ImageIcon size={12} /> {p.mediaUrls.length} Files</p>
                                    )}
                                </div>
                            </div>
                            <div className="flex items-center gap-2 flex-shrink-0" onClick={e => e.stopPropagation()}>
                                <button onClick={() => {
                                    const duplicate = { ...p, id: undefined, title: `${p.title} (Copy)`, status: 'DRAFT' as ContentStatus };
                                    setForm(duplicate);
                                    setEditingId(null);
                                    setViewMode('EDITOR');
                                }} className="p-2 bg-slate-100 dark:bg-slate-800 text-slate-500 hover:text-slate-700 dark:hover:text-slate-300 rounded-lg transition" title="Duplicate">
                                    <Copy size={16} />
                                </button>
                                <button onClick={() => handleDelete(p.id)} className="p-2 bg-red-50 dark:bg-red-900/20 text-red-500 hover:bg-red-100 dark:hover:bg-red-900/40 rounded-lg transition">
                                    <Trash2 size={16} />
                                </button>
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
};

export default ContentTab;
