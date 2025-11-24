import { Component, OnInit, OnDestroy } from '@angular/core';
import { ApiService } from '../../services/api.service';
import { AuthService } from '../../services/auth.service';
import { WebsocketService } from '../../services/websocket.service';
import { User, Message, Chat } from '../../models/user.model';
import { Subscription } from 'rxjs';

@Component({
    selector: 'app-chat',
    templateUrl: './chat.component.html',
    styleUrls: ['./chat.component.less']
})
export class ChatComponent implements OnInit, OnDestroy {
    chats: Chat[] = [];
    selectedChat: Chat | null = null;
    messages: Message[] = [];
    newMessage = '';
    users: User[] = [];
    currentUser: User | null = null;
    isLoading = true;
    private subscriptions = new Subscription();
    private pendingMessages = new Set<number>(); // Для отслеживания отправляемых сообщений

    constructor(
        private apiService: ApiService,
        private authService: AuthService,
        private websocketService: WebsocketService
    ) {}

    ngOnInit(): void {
        this.currentUser = this.authService.getCurrentUser();
        if (this.currentUser) {
            this.loadChats();
            this.loadUsers();
            this.setupWebSocket();
        }
    }

    loadChats(): void {
        this.apiService.getChats().subscribe({
            next: (chats) => {
                this.chats = chats;
                this.isLoading = false;
            },
            error: (error) => {
                console.error('Error loading chats:', error);
                this.isLoading = false;
            }
        });
    }

    loadUsers(): void {
        this.apiService.getUsers().subscribe(users => {
            this.users = users.filter(u => u.id !== this.currentUser!.id);
        });
    }

    selectChat(chat: Chat): void {
        this.selectedChat = chat;
        this.loadMessages(chat.partner.id);
        this.markMessagesAsRead(chat.partner.id);
    }

    startNewChat(user: User): void {
        const existingChat = this.chats.find(chat => chat.partner.id === user.id);
        if (existingChat) {
            this.selectChat(existingChat);
        } else {
            // Создаем новый чат сразу в реальном времени
            const newChat: Chat = {
                id: user.id,
                partner: user,
                lastMessage: undefined,
                unreadCount: 0
            };

            this.chats.unshift(newChat); // Добавляем в начало списка
            this.selectedChat = newChat;
            this.messages = [];

            console.log('✅ Новый чат создан в реальном времени:', user.name);
        }
    }

    loadMessages(userId: number): void {
        this.apiService.getMessages(userId).subscribe({
            next: (messages) => {
                this.messages = messages;
            },
            error: (error) => {
                console.error('Error loading messages:', error);
            }
        });
    }

    markMessagesAsRead(userId: number): void {
        this.apiService.markMessagesAsRead(userId).subscribe({
            next: () => {
                const chatIndex = this.chats.findIndex(chat => chat.partner.id === userId);
                if (chatIndex !== -1) {
                    this.chats[chatIndex].unreadCount = 0;
                }
            },
            error: (error) => {
                console.error('Error marking messages as read:', error);
            }
        });
    }

    sendMessage(): void {
        if (!this.newMessage.trim() || !this.selectedChat) return;

        const tempMessageId = Date.now(); // Временный ID для отслеживания
        this.pendingMessages.add(tempMessageId);

        // Создаем временное сообщение для мгновенного отображения
        const tempMessage: Message = {
            id: tempMessageId,
            senderId: this.currentUser!.id,
            receiverId: this.selectedChat.partner.id,
            content: this.newMessage.trim(),
            createdAt: new Date().toISOString(),
            read: false
        };

        // Добавляем временное сообщение
        this.messages.push(tempMessage);
        this.updateChatAfterSendingMessage(tempMessage);

        const originalMessage = this.newMessage;
        this.newMessage = '';

        // Отправляем сообщение на сервер
        this.apiService.sendMessage(this.selectedChat.partner.id, originalMessage).subscribe({
            next: (serverMessage) => {
                // Удаляем временное сообщение
                const tempIndex = this.messages.findIndex(msg => msg.id === tempMessageId);
                if (tempIndex !== -1) {
                    this.messages.splice(tempIndex, 1);
                }
                this.pendingMessages.delete(tempMessageId);

                // Серверное сообщение придет через WebSocket, не добавляем его здесь
                console.log('✅ Сообщение отправлено на сервер');
            },
            error: (error) => {
                console.error('Error sending message:', error);

                // Удаляем временное сообщение при ошибке
                const tempIndex = this.messages.findIndex(msg => msg.id === tempMessageId);
                if (tempIndex !== -1) {
                    this.messages.splice(tempIndex, 1);
                }
                this.pendingMessages.delete(tempMessageId);

                // Восстанавливаем текст сообщения
                this.newMessage = originalMessage;

                // Показываем ошибку
                alert('Ошибка отправки сообщения: ' + (error.error?.message || error.message));
            }
        });
    }

    // Новый метод: обновление чата после отправки сообщения
    private updateChatAfterSendingMessage(message: Message): void {
        if (!this.selectedChat) return;

        const chatIndex = this.chats.findIndex(chat => chat.partner.id === this.selectedChat!.partner.id);

        if (chatIndex !== -1) {
            // Обновляем существующий чат
            this.chats[chatIndex].lastMessage = message;
            this.chats[chatIndex].unreadCount = 0;

            // Перемещаем чат в начало списка
            const updatedChat = this.chats.splice(chatIndex, 1)[0];
            this.chats.unshift(updatedChat);
        } else {
            // Создаем новый чат (на случай если его почему-то нет)
            const newChat: Chat = {
                id: this.selectedChat.partner.id,
                partner: this.selectedChat.partner,
                lastMessage: message,
                unreadCount: 0
            };
            this.chats.unshift(newChat);
        }
    }

    setupWebSocket(): void {
        // Слушаем новые сообщения
        this.subscriptions.add(
            this.websocketService.onNewMessage().subscribe(message => {
                this.handleIncomingMessage(message);
            })
        );
    }

    // Обработка входящих сообщений в реальном времени
    private handleIncomingMessage(message: Message): void {
        const isIncoming = message.receiverId === this.currentUser!.id;
        const isOutgoing = message.senderId === this.currentUser!.id;

        // Пропускаем сообщения, которые уже обрабатываются как временные
        if (this.pendingMessages.has(message.id)) {
            return;
        }

        if (isIncoming || isOutgoing) {
            const partnerId = isIncoming ? message.senderId : message.receiverId;

            // Обновляем или создаем чат
            this.updateOrCreateChat(partnerId, message, isIncoming);

            // Если это активный чат - добавляем сообщение
            if (this.selectedChat && this.selectedChat.partner.id === partnerId) {
                // Проверяем, нет ли уже такого сообщения
                const messageExists = this.messages.some(msg => msg.id === message.id);
                if (!messageExists) {
                    this.messages.push(message);
                }

                if (isIncoming) {
                    this.markMessagesAsRead(partnerId);
                }
            }
        }
    }

    // Обновление или создание чата в реальном времени
    private updateOrCreateChat(partnerId: number, message: Message, isIncoming: boolean): void {
        const chatIndex = this.chats.findIndex(chat => chat.partner.id === partnerId);

        if (chatIndex !== -1) {
            // Обновляем существующий чат
            this.chats[chatIndex].lastMessage = message;
            if (isIncoming && (!this.selectedChat || this.selectedChat.partner.id !== partnerId)) {
                this.chats[chatIndex].unreadCount++;
            } else {
                this.chats[chatIndex].unreadCount = 0;
            }

            // Перемещаем в начало списка
            const updatedChat = this.chats.splice(chatIndex, 1)[0];
            this.chats.unshift(updatedChat);
        } else {
            // Создаем новый чат
            const partner = this.users.find(u => u.id === partnerId);
            if (partner) {
                const newChat: Chat = {
                    id: partnerId,
                    partner: partner,
                    lastMessage: message,
                    unreadCount: isIncoming ? 1 : 0
                };
                this.chats.unshift(newChat);
                console.log('✅ Новый чат создан через WebSocket:', partner.name);
            }
        }
    }

    getInitials(name: string): string {
        return name.split(' ').map(word => word[0]).join('').toUpperCase();
    }

    formatDate(dateString: string): string {
        const date = new Date(dateString);
        const now = new Date();
        const diffMs = now.getTime() - date.getTime();
        const diffMins = Math.floor(diffMs / 60000);
        const diffHours = Math.floor(diffMs / 3600000);

        if (diffMins < 1) return 'только что';
        if (diffMins < 60) return `${diffMins} мин назад`;
        if (diffHours < 24) return `${diffHours} ч назад`;

        return date.toLocaleDateString('ru-RU', {
            day: 'numeric',
            month: 'short',
            hour: '2-digit',
            minute: '2-digit'
        });
    }

    getPartnerId(chat: Chat): number {
        return chat.partner?.id || 0;
    }

    ngOnDestroy(): void {
        this.subscriptions.unsubscribe();
    }
}