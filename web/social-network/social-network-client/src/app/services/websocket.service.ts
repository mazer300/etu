import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { io, Socket } from 'socket.io-client';
import { Post, Message } from '../models/user.model';

@Injectable({
    providedIn: 'root'
})
export class WebsocketService {
    private socket: Socket;
    private isConnected = false;

    constructor() {
        this.socket = io('http://localhost:3001', {
            transports: ['websocket', 'polling'],
            reconnection: true,
            reconnectionAttempts: 5,
            reconnectionDelay: 1000
        });

        this.socket.on('connect', () => {
            this.isConnected = true;
            console.log('✅ WebSocket connected');
        });

        this.socket.on('disconnect', () => {
            this.isConnected = false;
            console.log('❌ WebSocket disconnected');
        });

        this.socket.on('connect_error', (error) => {
            console.error('❌ WebSocket connection error:', error);
        });
    }

    // Слушаем новые посты
    onNewPost(): Observable<Post> {
        return new Observable<Post>(observer => {
            this.socket.on('new_post', (post: Post) => {
                observer.next(post);
            });
        });
    }

    // Слушаем обновления постов
    onPostUpdate(): Observable<Post> {
        return new Observable<Post>(observer => {
            this.socket.on('post_updated', (post: Post) => {
                observer.next(post);
            });
        });
    }

    // Слушаем удаление постов
    onPostDelete(): Observable<number> {
        return new Observable<number>(observer => {
            this.socket.on('post_deleted', (postId: number) => {
                observer.next(postId);
            });
        });
    }

    // Слушаем новые сообщения
    onNewMessage(): Observable<Message> {
        return new Observable<Message>(observer => {
            this.socket.on('new_message', (message: Message) => {
                observer.next(message);
            });
        });
    }

    // Подключаемся к комнате пользователя
    joinUserRoom(userId: number): void {
        this.socket.emit('join_user', userId);
    }

    // Отключаемся от комнаты
    leaveUserRoom(userId: number): void {
        this.socket.emit('leave_user', userId);
    }

    // Проверка подключения
    isSocketConnected(): boolean {
        return this.isConnected;
    }

    disconnect(): void {
        this.socket.disconnect();
    }
}