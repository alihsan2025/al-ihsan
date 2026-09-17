export interface Appeal {
    id: string;
    title: string;
    description: string;
    raised: number;
    goal: number;
    imageUrl?: string;
}

export interface Post {
    id: string;
    title: string;
    date: string;
    excerpt: string;
    imageUrl?: string;
    link?: string;
}
