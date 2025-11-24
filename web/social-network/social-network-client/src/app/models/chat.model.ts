export interface Message {
    id: number;
    senderId: number;
    receiverId: number;
    content: string;
    createdAt: string;
    read: boolean;
}

export interface Chat {
    id: number;
    partner: any;
    lastMessage?: Message;
    unreadCount: number;
}