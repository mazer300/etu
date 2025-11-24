import { Component } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { AuthService } from '../../services/auth.service';

@Component({
    selector: 'app-registration',
    templateUrl: './registration.component.html',
    styleUrls: ['./registration.component.less']
})
export class RegistrationComponent {
    registerForm: FormGroup;
    isSubmitting = false;
    errorMessage = '';

    constructor(
        private fb: FormBuilder,
        private authService: AuthService,
        private router: Router
    ) {
        this.registerForm = this.fb.group({
            name: ['', [Validators.required, Validators.minLength(2), Validators.maxLength(50)]],
            email: ['', [Validators.required, Validators.email]],
            password: ['', [Validators.required, Validators.minLength(6)]],
            birthDate: ['', [Validators.required]],
            agreeTerms: [false, [Validators.requiredTrue]]
        });

        // Если пользователь уже авторизован, перенаправляем на ленту
        if (this.authService.isAuthenticated()) {
            this.router.navigate(['/news']);
        }
    }

    onSubmit(): void {
        if (this.registerForm.valid) {
            this.isSubmitting = true;
            this.errorMessage = '';

            const formData = this.registerForm.value;

            this.authService.register({
                name: formData.name,
                email: formData.email,
                password: formData.password,
                birthDate: formData.birthDate
            }).subscribe({
                next: (user) => {
                    this.isSubmitting = false;
                    this.router.navigate(['/news']);
                },
                error: (error) => {
                    this.isSubmitting = false;
                    this.errorMessage = error.error?.message || 'Ошибка регистрации. Проверьте подключение к админке.';
                    console.error('Registration error:', error);
                }
            });
        } else {
            // Показываем ошибки валидации
            this.markFormGroupTouched();
        }
    }

    private markFormGroupTouched(): void {
        Object.keys(this.registerForm.controls).forEach(key => {
            const control = this.registerForm.get(key);
            control?.markAsTouched();
        });
    }

    get today(): string {
        return new Date().toISOString().split('T')[0];
    }

    // Геттеры для удобного доступа к полям формы
    get name() { return this.registerForm.get('name'); }
    get email() { return this.registerForm.get('email'); }
    get password() { return this.registerForm.get('password'); }
    get birthDate() { return this.registerForm.get('birthDate'); }
    get agreeTerms() { return this.registerForm.get('agreeTerms'); }
}