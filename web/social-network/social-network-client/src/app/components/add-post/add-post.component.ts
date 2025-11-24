import { Component } from '@angular/core';
import { Router } from '@angular/router';
import { ApiService } from '../../services/api.service';
import { AuthService } from '../../services/auth.service';

@Component({
    selector: 'app-add-post',
    templateUrl: './add-post.component.html',
    styleUrls: ['./add-post.component.less']
})
export class AddPostComponent {
    postContent = '';
    selectedImage: File | null = null;
    imagePreview: string | null = null;
    isSubmitting = false;
    errorMessage = '';

    constructor(
        private apiService: ApiService,
        public authService: AuthService,
        private router: Router
    ) {}

    onImageSelected(event: any): void {
        const file = event.target.files[0];
        if (file) {
            // Проверяем тип файла
            if (!file.type.startsWith('image/')) {
                this.errorMessage = 'Пожалуйста, выберите изображение';
                return;
            }

            // Проверяем размер файла (макс 5MB)
            if (file.size > 5 * 1024 * 1024) {
                this.errorMessage = 'Размер изображения не должен превышать 5MB';
                return;
            }

            this.selectedImage = file;
            this.errorMessage = '';

            // Создаем preview
            const reader = new FileReader();
            reader.onload = () => {
                this.imagePreview = reader.result as string;
            };
            reader.readAsDataURL(file);
        }
    }

    removeImage(): void {
        this.selectedImage = null;
        this.imagePreview = null;
        this.errorMessage = '';
    }

    onSubmit(): void {
        if (!this.postContent.trim()) {
            this.errorMessage = 'Текст поста не может быть пустым';
            return;
        }

        if (this.postContent.trim().length > 1000) {
            this.errorMessage = 'Текст поста не должен превышать 1000 символов';
            return;
        }

        this.isSubmitting = true;
        this.errorMessage = '';

        this.apiService.createPost({
            content: this.postContent,
            image: this.selectedImage || undefined
        }).subscribe({
            next: (post) => {
                this.isSubmitting = false;
                this.postContent = '';
                this.removeImage();
                this.router.navigate(['/news']);
            },
            error: (error) => {
                console.error('Error creating post:', error);
                this.isSubmitting = false;
                this.errorMessage = error.error?.message || 'Ошибка создания поста';
            }
        });
    }

    getInitials(): string {
        const user = this.authService.getCurrentUser();
        return user ? user.name.split(' ').map(word => word[0]).join('').toUpperCase() : '';
    }
}