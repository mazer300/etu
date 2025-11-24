import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { AuthService } from '../../services/auth.service';
import { User } from '../../models/user.model';

@Component({
    selector: 'app-navbar',
    templateUrl: './navbar.component.html',
    styleUrls: ['./navbar.component.less']
})
export class NavbarComponent implements OnInit {
    currentUser: User | null = null;

    constructor(
        private authService: AuthService,
        private router: Router
    ) {}

    ngOnInit(): void {
        this.authService.currentUser$.subscribe(user => {
            this.currentUser = user;
        });
    }

    getInitials(name: string): string {
        return name.split(' ').map(word => word[0]).join('').toUpperCase();
    }

    getRoleDisplayName(role: string): string {
        switch (role) {
            case 'admin': return 'Админ';
            case 'moderator': return 'Модератор';
            default: return 'Пользователь';
        }
    }

    onAvatarError(event: any): void {
        // Если картинка не загружается, заменяем на default avatar
        const target = event.target;
        target.style.display = 'none';
        target.parentElement.classList.add('default-avatar');
        target.parentElement.innerHTML = this.getInitials(this.currentUser?.name || '');
    }

    logout(): void {
        if (confirm('Вы уверены, что хотите выйти?')) {
            this.authService.logout().subscribe({
                next: () => {
                    this.router.navigate(['/login']);
                },
                error: (error) => {
                    console.error('Logout error:', error);
                    this.router.navigate(['/login']);
                }
            });
        }
    }
}