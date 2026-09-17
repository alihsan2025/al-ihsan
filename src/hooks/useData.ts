import { useState, useEffect } from 'react';
import type { Appeal, Post } from '../types';
import { supabase } from '../lib/supabase';

interface AppealRow {
    id: string;
    title: string | null;
    description: string | null;
    amount: number | null;
}

interface PostRow {
    id: string;
    title: string | null;
    body: string | null;
    created_at: string | null;
    image_url: string | null;
    link: string | null;
}

export const useAppeals = () => {
    const [appeals, setAppeals] = useState<Appeal[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchAppeals = async () => {
            try {
                const { data, error } = await supabase
                    .from('appeals')
                    .select('*');

                if (error) throw error;

                const mappedAppeals = (data as AppealRow[])
                    .filter((appeal) => Number(appeal.amount ?? 0) > 0)
                    .map((appeal) => ({
                        id: appeal.id,
                        title: appeal.title || 'Urgent Appeal',
                        description: appeal.description || 'Support this ongoing relief effort.',
                        raised: 0,
                        goal: Number(appeal.amount ?? 0),
                    }));

                setAppeals(mappedAppeals);
            } catch (error) {
                console.error("Error fetching appeals:", error);
            } finally {
                setLoading(false);
            }
        };

        fetchAppeals();
    }, []);

    return { appeals, loading };
};

export const usePosts = () => {
    const [posts, setPosts] = useState<Post[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchPosts = async () => {
            try {
                const { data, error } = await supabase
                    .from('posts')
                    .select('*')
                    .order('created_at', { ascending: false })
                    .limit(3);

                if (error) throw error;

                const mappedPosts = (data as PostRow[]).map((post) => ({
                    id: post.id,
                    title: post.title || 'Untitled Update',
                    date: post.created_at
                        ? new Date(post.created_at).toLocaleDateString('en-GB', {
                            day: 'numeric',
                            month: 'short',
                            year: 'numeric',
                        })
                        : 'Recent update',
                    excerpt: post.body?.trim()
                        ? `${post.body.trim().slice(0, 110)}${post.body.trim().length > 110 ? '...' : ''}`
                        : 'New update from Al-Ihsan Relief.',
                    imageUrl: post.image_url ?? undefined,
                    link: post.link ?? undefined,
                }));

                setPosts(mappedPosts);
            } catch (error) {
                console.error("Error fetching posts:", error);
            } finally {
                setLoading(false);
            }
        };

        fetchPosts();
    }, []);

    return { posts, loading };
};
