import { Component, OnInit } from '@angular/core';
import { AuthService } from '../../services/auth.service';
import { ApiService } from '../../services/api.service';
import { User } from '../../models/user.model';

@Component({
    selector: 'app-friends',
    templateUrl: './friends.component.html',
    styleUrls: ['./friends.component.less']
})
export class FriendsComponent implements OnInit {
    currentUser: User | null = null;
    friends: User[] = [];
    allUsers: User[] = [];
    isLoading = true;
    searchQuery = '';

    constructor(
        private authService: AuthService,
        private apiService: ApiService
    ) {}

    ngOnInit(): void {
        this.currentUser = this.authService.getCurrentUser();

        if (this.currentUser) {
            this.loadFriends();
        }
    }

    loadFriends(): void {
        this.isLoading = true;
        this.apiService.getFriends(this.currentUser!.id).subscribe({
            next: (friends) => {
                this.friends = friends;
                this.loadAllUsers();
                this.isLoading = false;
                console.log('✅ Друзья загружены:', this.friends.length);
            },
            error: (error) => {
                console.error('Error loading friends:', error);
                this.isLoading = false;
            }
        });
    }

    loadAllUsers(): void {
        this.apiService.getUsers(this.searchQuery).subscribe({
            next: (users) => {
                // Исключаем текущего пользователя и уже добавленных друзей
                this.allUsers = users.filter(user =>
                    user.id !== this.currentUser!.id &&
                    !this.friends.some(friend => friend.id === user.id)
                );
                console.log('✅ Пользователи загружены:', this.allUsers.length);
            },
            error: (error) => {
                console.error('Error loading users:', error);
            }
        });
    }

    onSearch(): void {
        this.loadAllUsers();
    }

    addFriend(userId: number): void {
        this.apiService.addFriend(userId).subscribe({
            next: () => {
                console.log('✅ Друг добавлен:', userId);
                // Находим добавленного пользователя
                const addedUser = this.allUsers.find(u => u.id === userId);
                if (addedUser) {
                    // Добавляем в друзья
                    this.friends.push(addedUser);
                    // Удаляем из списка возможных друзей
                    this.allUsers = this.allUsers.filter(u => u.id !== userId);

                    // Показываем уведомление
                    this.showNotification(`${addedUser.name} добавлен в друзья`, 'success');
                }
            },
            error: (error) => {
                console.error('Error adding friend:', error);
                this.showNotification('Ошибка при добавлении в друзья', 'error');
            }
        });
    }

    removeFriend(friendId: number): void {
        this.apiService.removeFriend(friendId).subscribe({
            next: () => {
                console.log('✅ Друг удален:', friendId);
                // Находим удаляемого друга
                const removedFriend = this.friends.find(f => f.id === friendId);
                if (removedFriend) {
                    // Удаляем из друзей
                    this.friends = this.friends.filter(f => f.id !== friendId);
                    // Добавляем в список возможных друзей
                    this.allUsers.push(removedFriend);

                    // Показываем уведомление
                    this.showNotification(`${removedFriend.name} удален из друзей`, 'info');
                }
            },
            error: (error) => {
                console.error('Error removing friend:', error);
                this.showNotification('Ошибка при удалении из друзей', 'error');
            }
        });
    }

    getInitials(name: string): string {
        return name.split(' ').map(word => word[0]).join('').toUpperCase();
    }

    // Вспомогательный метод для уведомлений
    private showNotification(message: string, type: 'success' | 'error' | 'info'): void {
        // Можно добавить Toast уведомления или использовать alert
        if (type === 'error') {
            alert('❌ ' + message);
        } else {
            // Для успешных операций можно сделать более тонкое уведомление
            console.log('📢 ' + message);
        }
    }
}