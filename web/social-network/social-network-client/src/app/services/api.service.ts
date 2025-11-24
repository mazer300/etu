import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable, map } from 'rxjs';
import { User, Post, Friendship, RegisterData, LoginData, Message, Chat } from '../models/user.model';
import { AuthService } from './auth.service';

@Injectable({
    providedIn: 'root'
})
export class ApiService {
    // Используем относительные пути для работы через proxy
    private apiUrl = '/api';
    private adminUrl = 'https://localhost:3443';

    constructor(
        private http: HttpClient,
        private authService: AuthService
    ) { }

    private getHeaders(): HttpHeaders {
        return this.authService.getAuthHeaders();
    }

    // Auth methods
    register(userData: RegisterData): Observable<any> {
        return this.http.post<any>(`${this.apiUrl}/auth/register`, userData).pipe(
            map(response => ({
                ...response,
                user: this.fixAvatarUrl(response.user)
            }))
        );
    }

    login(loginData: LoginData): Observable<any> {
        return this.http.post<any>(`${this.apiUrl}/auth/login`, loginData).pipe(
            map(response => ({
                ...response,
                user: this.fixAvatarUrl(response.user)
            }))
        );
    }

    logout(): Observable<any> {
        return this.http.post(`${this.apiUrl}/auth/logout`, {}, {
            headers: this.getHeaders()
        });
    }

    getCurrentUser(): Observable<User> {
        return this.http.get<User>(`${this.apiUrl}/auth/me`, {
            headers: this.getHeaders()
        }).pipe(
            map(user => this.fixAvatarUrl(user))
        );
    }

    // Users methods
    getUsers(search?: string): Observable<User[]> {
        const params: any = {};
        if (search) {
            params.search = search;
        }
        return this.http.get<User[]>(`${this.apiUrl}/users`, {
            params,
            headers: this.getHeaders()
        }).pipe(
            map(users => users.map(user => this.fixAvatarUrl(user)))
        );
    }

    getUserById(id: number): Observable<User> {
        return this.http.get<User>(`${this.apiUrl}/users/${id}`, {
            headers: this.getHeaders()
        }).pipe(
            map(user => this.fixAvatarUrl(user))
        );
    }

    updateUser(id: number, userData: Partial<User>): Observable<User> {
        return this.http.put<User>(`${this.apiUrl}/users/${id}`, userData, {
            headers: this.getHeaders()
        }).pipe(
            map(user => this.fixAvatarUrl(user))
        );
    }

    // Posts methods
    getPosts(): Observable<Post[]> {
        return this.http.get<Post[]>(`${this.apiUrl}/posts`, {
            headers: this.getHeaders()
        }).pipe(
            map(posts => posts.map(post => ({
                ...post,
                author: post.author ? this.fixAvatarUrl(post.author) : post.author
            })))
        );
    }

    getUserPosts(userId: number): Observable<Post[]> {
        return this.http.get<Post[]>(`${this.apiUrl}/users/${userId}/posts`, {
            headers: this.getHeaders()
        }).pipe(
            map(posts => posts.map(post => ({
                ...post,
                author: post.author ? this.fixAvatarUrl(post.author) : post.author
            })))
        );
    }

    getFriendsPosts(userId: number): Observable<Post[]> {
        return this.http.get<Post[]>(`${this.apiUrl}/users/${userId}/friends/posts`, {
            headers: this.getHeaders()
        }).pipe(
            map(posts => posts.map(post => ({
                ...post,
                author: post.author ? this.fixAvatarUrl(post.author) : post.author
            })))
        );
    }

    createPost(postData: { content: string; image?: File }): Observable<Post> {
        const headers = this.getHeaders();

        return this.http.post<Post>(`${this.apiUrl}/posts`,
            { content: postData.content },
            { headers }
        ).pipe(
            map(post => ({
                ...post,
                author: post.author ? this.fixAvatarUrl(post.author) : post.author
            }))
        );
    }

    deletePost(postId: number): Observable<any> {
        return this.http.delete(`${this.apiUrl}/posts/${postId}`, {
            headers: this.getHeaders()
        });
    }

    likePost(postId: number): Observable<any> {
        return this.http.post(`${this.apiUrl}/posts/${postId}/like`, {}, {
            headers: this.getHeaders()
        });
    }

    // Friends methods
    getFriends(userId: number): Observable<User[]> {
        return this.http.get<User[]>(`${this.apiUrl}/users/${userId}/friends`, {
            headers: this.getHeaders()
        }).pipe(
            map(friends => friends.map(friend => this.fixAvatarUrl(friend)))
        );
    }

    addFriend(friendId: number): Observable<any> {
        return this.http.post(`${this.apiUrl}/friends`, { friendId }, {
            headers: this.getHeaders()
        });
    }

    removeFriend(friendId: number): Observable<any> {
        return this.http.delete(`${this.apiUrl}/friends/${friendId}`, {
            headers: this.getHeaders()
        });
    }

    // Chat methods
    getChats(): Observable<Chat[]> {
        return this.http.get<Chat[]>(`${this.apiUrl}/chats`, {
            headers: this.getHeaders()
        }).pipe(
            map(chats => chats.map(chat => ({
                ...chat,
                partner: this.fixAvatarUrl(chat.partner)
            })))
        );
    }

    getMessages(userId: number): Observable<Message[]> {
        return this.http.get<Message[]>(`${this.apiUrl}/chat/${userId}`, {
            headers: this.getHeaders()
        });
    }

    sendMessage(userId: number, content: string): Observable<Message> {
        return this.http.post<Message>(`${this.apiUrl}/chat/${userId}`, { content }, {
            headers: this.getHeaders()
        });
    }

    // ЧАТ: Отметка сообщений как прочитанных
    markMessagesAsRead(userId: number): Observable<any> {
        return this.http.post(`${this.apiUrl}/chat/${userId}/read`, {}, {
            headers: this.getHeaders()
        });
    }

    // Avatar methods
    uploadAvatar(image: File): Observable<User> {
        const formData = new FormData();
        formData.append('avatar', image);

        return this.http.post<User>(`${this.apiUrl}/users/avatar`, formData, {
            headers: this.getHeaders()
        }).pipe(
            map(user => this.fixAvatarUrl(user))
        );
    }

    removeAvatar(): Observable<User> {
        return this.http.delete<User>(`${this.apiUrl}/users/avatar`, {
            headers: this.getHeaders()
        }).pipe(
            map(user => this.fixAvatarUrl(user))
        );
    }

    // File upload method (for posts with images)
    uploadPostImage(image: File): Observable<any> {
        const formData = new FormData();
        formData.append('image', image);

        return this.http.post(`${this.apiUrl}/upload`, formData, {
            headers: this.getHeaders()
        });
    }

    // Health check
    healthCheck(): Observable<any> {
        return this.http.get(`${this.apiUrl}/health`);
    }

    // Admin methods (if user is admin)
    getAdminStats(): Observable<any> {
        return this.http.get(`${this.apiUrl}/admin/stats`, {
            headers: this.getHeaders()
        });
    }

    // Search methods
    searchUsers(query: string): Observable<User[]> {
        return this.getUsers(query);
    }

    searchPosts(query: string): Observable<Post[]> {
        return this.http.get<Post[]>(`${this.apiUrl}/posts/search`, {
            params: { query },
            headers: this.getHeaders()
        }).pipe(
            map(posts => posts.map(post => ({
                ...post,
                author: post.author ? this.fixAvatarUrl(post.author) : post.author
            })))
        );
    }

    // Метод для исправления URL аватарок
    private fixAvatarUrl(user: User): User {
        if (user && user.avatar && !user.avatar.startsWith('http') && !user.avatar.startsWith('/public')) {
            user.avatar = `/public${user.avatar}`;
        }
        return user;
    }
}