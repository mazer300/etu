export interface User {
    id: number;
    name: string;
    email: string;
    birthDate: string;
    avatar: string | null;
    role: 'user' | 'admin' | 'moderator';
    status: 'active' | 'pending' | 'blocked';
    avatarBlocked: boolean;
    createdAt: string;
    updatedAt: string;
    lastActivity?: number;
}

export interface Post {
    id: number;
    userId: number;
    content: string;
    image: string | null;
    createdAt: string;
    likes: number;
    comments: number;
    blocked: boolean;
    author?: User;
    // Добавляем опциональное свойство для локального состояния
    isLiked?: boolean;
}

export interface Friendship {
    id: number;
    userId: number;
    friendId: number;
}

export interface RegisterData {
    name: string;
    email: string;
    password: string;
    birthDate: string;
}

export interface LoginData {
    email: string;
    password: string;
}

export interface ApiResponse<T> {
    success: boolean;
    data?: T;
    message?: string;
    error?: string;
}

export interface PaginationParams {
    page: number;
    limit: number;
    sortBy?: string;
    sortOrder?: 'asc' | 'desc';
}

export interface SearchParams {
    query: string;
    type?: 'users' | 'posts' | 'friends';
}

export interface Notification {
    id: number;
    userId: number;
    type: 'like' | 'comment' | 'friend_request' | 'message';
    message: string;
    read: boolean;
    createdAt: string;
    relatedId?: number;
}

// Интерфейсы для чата
export interface Message {
    id: number;
    senderId: number;
    receiverId: number;
    content: string;
    createdAt: string;
    read: boolean;
    sender?: User;
}

export interface Chat {
    id: number;
    partner: User;
    lastMessage?: Message;
    unreadCount: number;
}