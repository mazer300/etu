import { Component, OnInit, OnDestroy } from '@angular/core';
import { AuthService } from '../../services/auth.service';
import { ApiService } from '../../services/api.service';
import { WebsocketService } from '../../services/websocket.service';
import { User, Post } from '../../models/user.model';
import { Subscription } from 'rxjs';

@Component({
    selector: 'app-news-feed',
    templateUrl: './news-feed.component.html',
    styleUrls: ['./news-feed.component.less']
})
export class NewsFeedComponent implements OnInit, OnDestroy {
    currentUser: User | null = null;
    posts: Post[] = [];
    isLoading = true;
    private subscriptions = new Subscription();

    constructor(
        private authService: AuthService,
        private apiService: ApiService,
        private websocketService: WebsocketService
    ) {}

    ngOnInit(): void {
        this.currentUser = this.authService.getCurrentUser();

        if (this.currentUser) {
            this.loadPosts();
            this.setupWebSocket();
        }
    }

    loadPosts(): void {
        this.isLoading = true;
        this.apiService.getFriendsPosts(this.currentUser!.id).subscribe({
            next: (posts) => {
                // Добавляем флаг для лайков
                this.posts = posts.map(post => ({
                    ...post,
                    isLiked: false // Можно добавить логику проверки лайков
                }));
                this.isLoading = false;
            },
            error: (error) => {
                console.error('Error loading posts:', error);
                this.isLoading = false;
            }
        });
    }

    setupWebSocket(): void {
        // Слушаем новые посты
        this.subscriptions.add(
            this.websocketService.onNewPost().subscribe(post => {
                if (this.isPostFromFriend(post) || post.userId === this.currentUser!.id) {
                    this.posts.unshift({
                        ...post,
                        isLiked: false
                    });
                }
            })
        );

        // Слушаем обновления постов
        this.subscriptions.add(
            this.websocketService.onPostUpdate().subscribe(updatedPost => {
                const index = this.posts.findIndex(p => p.id === updatedPost.id);
                if (index !== -1) {
                    const currentPost = this.posts[index];
                    this.posts[index] = {
                        ...updatedPost,
                        isLiked: currentPost.isLiked || false // Сохраняем состояние лайка
                    };
                }
            })
        );

        // Слушаем удаление постов
        this.subscriptions.add(
            this.websocketService.onPostDelete().subscribe(postId => {
                this.posts = this.posts.filter(p => p.id !== postId);
            })
        );

        // Подключаемся к WebSocket комнате
        this.websocketService.joinUserRoom(this.currentUser!.id);
    }

    isPostFromFriend(post: Post): boolean {
        // Проверяем, является ли автор поста другом текущего пользователя
        // Эта логика должна быть реализована на сервере
        return true; // Заглушка
    }

    likePost(post: Post): void {
        this.apiService.likePost(post.id).subscribe({
            next: () => {
                post.likes = (post.likes || 0) + 1;
                post.isLiked = true;
            },
            error: (error) => {
                console.error('Error liking post:', error);
            }
        });
    }

    // Обработка ошибок загрузки изображений
    onImageError(event: any, post: Post): void {
        console.error('Error loading image for post:', post.id);
        const img = event.target;
        img.style.display = 'none';

        // Можно показать placeholder вместо сломанного изображения
        const container = img.parentElement;
        container.innerHTML = `
            <div class="image-error-placeholder">
                <i class="fas fa-image text-muted"></i>
                <p class="text-muted small mt-2">Изображение не загружено</p>
            </div>
        `;
    }

    // Дополнительные методы для действий с постами
    sharePost(post: Post): void {
        // Логика для кнопки "Поделиться"
        console.log('Sharing post:', post.id);
        // Можно добавить функционал шеринга
    }

    commentPost(post: Post): void {
        // Логика для кнопки "Комментировать"
        console.log('Commenting on post:', post.id);
        // Можно добавить функционал комментариев
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
        const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));

        if (diffMins < 1) return 'только что';
        if (diffMins < 60) return `${diffMins} мин назад`;
        if (diffHours < 24) return `${diffHours} ч назад`;
        if (diffDays === 1) return 'вчера';
        if (diffDays < 7) return `${diffDays} дн назад`;

        return date.toLocaleDateString('ru-RU', {
            day: 'numeric',
            month: 'long',
            year: 'numeric',
            hour: '2-digit',
            minute: '2-digit'
        });
    }

    ngOnDestroy(): void {
        if (this.currentUser) {
            this.websocketService.leaveUserRoom(this.currentUser.id);
        }
        this.subscriptions.unsubscribe();
    }
}